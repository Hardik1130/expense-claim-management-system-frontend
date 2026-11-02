import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Eye,
    Download,
    Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

import ConfirmDialog from '../components/ConfirmDialog';
import useAuth from '../hooks/useAuth';

import { getClaim, getManagerClaim } from '../services/claimService';
import {
    viewReceipt,
    downloadReceipt,
    deleteReceipt
} from '../services/receiptService';

import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

export default function ClaimDetails() {
    const { id } = useParams();
    const { user } = useAuth();

    const manager = user?.role === 'MANAGER';

    const [claim, setClaim] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Get receipt ID from claim details response
    const receiptId =
        claim?.receiptId ||
        claim?.receipt?.id ||
        claim?.receipt?.receiptId;

    // Handle API errors, including Blob error responses
    const showApiError = async (error, fallback) => {
        const data = error.response?.data;

        if (data instanceof Blob) {
            try {
                const text = await data.text();
                const parsed = JSON.parse(text);
                toast.error(parsed.message || fallback);
                return;
            } catch {
                // Use fallback message
            }
        }

        toast.error(data?.message || fallback);
    };

    // Fetch receipt and open it in a new tab
    const handleViewReceipt = async () => {
        if (!receiptId) {
            toast.error('Receipt ID is missing from claim details.');
            return;
        }

        // Open synchronously to avoid popup blockers
        const newTab = window.open('', '_blank');

        try {
            const response = await viewReceipt(id, receiptId);

            const fileUrl = URL.createObjectURL(response.data);

            if (newTab) {
                newTab.location.href = fileUrl;
            } else {
                window.location.href = fileUrl;
            }

            setTimeout(() => URL.revokeObjectURL(fileUrl), 60000);
        } catch (error) {
            newTab?.close();
            await showApiError(error, 'Unable to view receipt.');
        }
    };

    // Download receipt
    const handleDownloadReceipt = async () => {
        if (!receiptId) {
            toast.error('Receipt ID is missing from claim details.');
            return;
        }

        try {
            const response = await downloadReceipt(id, receiptId);

            const fileUrl = URL.createObjectURL(response.data);
            const link = document.createElement('a');

            const filename =
                claim.receiptOriginalFilename ||
                claim.receipt?.originalFilename ||
                'expense-receipt';

            link.href = fileUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => URL.revokeObjectURL(fileUrl), 60000);

            toast.success('Receipt downloaded successfully.');
        } catch (error) {
            await showApiError(error, 'Unable to download receipt.');
        }
    };

    // Delete receipt
    const handleDeleteReceipt = async () => {
        if (!receiptId) {
            toast.error('Receipt ID is missing from claim details.');
            return;
        }

        try {
            setDeleting(true);

            await deleteReceipt(id, receiptId);

            setClaim(prev => ({
                ...prev,
                receiptAttached: false,
                receiptId: null,
                receipt: null
            }));

            setShowDeleteModal(false);
            toast.success('Receipt deleted successfully.');
        } catch (error) {
            await showApiError(error, 'Unable to delete receipt.');
        } finally {
            setDeleting(false);
        }
    };

    // Fetch claim details
    useEffect(() => {
        const fetchClaim = async () => {
            try {
                setLoading(true);

                const response = manager
                    ? await getManagerClaim(id)
                    : await getClaim(id);

                setClaim(response.data.data);
            } catch (error) {
                toast.error(
                    error.response?.data?.message ||
                    'Unable to load claim details.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchClaim();
    }, [id, manager]);

    if (loading) {
        return (
            <div className="p-6 text-center">
                Loading claim details...
            </div>
        );
    }

    if (!claim) {
        return (
            <div className="rounded-xl border bg-white p-8 text-center">
                <p className="text-red-600">
                    Claim not found or access denied.
                </p>

                <Link
                    to="/claims"
                    className="mt-4 inline-block text-indigo-600"
                >
                    Back to claims
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6">

            <Link
                to="/claims"
                className="inline-flex items-center gap-2 text-sm text-slate-500"
            >
                <ArrowLeft size={16} />
                Back to claims
            </Link>

            <div>
                <p className="text-xs font-semibold uppercase text-indigo-600">
                    {claim.id}
                </p>

                <h1 className="mt-2 text-3xl font-bold">
                    {claim.title}
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Submitted by {claim.employeeName}
                </p>
            </div>

            <section className="rounded-2xl border bg-white p-6">

                <h2 className="font-semibold">
                    Expense information
                </h2>

                <div className="mt-5 grid grid-cols-2 gap-5">

                    <div>
                        <p className="text-xs text-slate-400">
                            Amount
                        </p>
                        <p className="mt-1 font-semibold">
                            {formatCurrency(claim.amount)}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-400">
                            Category
                        </p>
                        <p className="mt-1 font-semibold">
                            {claim.categoryName}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-400">
                            Expense date
                        </p>
                        <p className="mt-1 font-semibold">
                            {formatDate(claim.expenseDate)}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-400">
                            Status
                        </p>
                        <p className="mt-1 font-semibold">
                            {claim.status}
                        </p>
                    </div>

                </div>

                <div className="mt-6 border-t pt-5">
                    <p className="text-xs text-slate-400">
                        Description
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                        {claim.description || 'No description provided.'}
                    </p>
                </div>

                {manager && (
                    <div className="mt-6 border-t pt-5">
                        <p className="text-xs text-slate-400">
                            Employee email
                        </p>

                        <p className="mt-1 font-semibold">
                            {claim.employeeEmail}
                        </p>
                    </div>
                )}

                {claim.managerComment && (
                    <div className="mt-6 rounded-xl bg-slate-50 p-4">
                        <p className="text-xs text-slate-400">
                            Manager comment
                        </p>

                        <p className="mt-2 text-sm">
                            {claim.managerComment}
                        </p>
                    </div>
                )}

                {/* Receipt Section */}
                <div className="mt-6 rounded-xl border border-dashed p-4">

                    <div className="flex items-center justify-between gap-4">

                        <div>
                            <p className="text-sm font-semibold">
                                Receipt attachment
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                {claim.receiptAttached
                                    ? 'Receipt is attached.'
                                    : 'No receipt attached.'}
                            </p>
                        </div>

                        {claim.receiptAttached && (
                            <div className="flex items-center gap-2">

                                {/* View Receipt */}
                                <button
                                    type="button"
                                    onClick={handleViewReceipt}
                                    title="View receipt"
                                    className="rounded-lg border p-2 text-indigo-600 hover:bg-indigo-50"
                                >
                                    <Eye size={18} />
                                </button>

                                {/* Download Receipt */}
                                <button
                                    type="button"
                                    onClick={handleDownloadReceipt}
                                    title="Download receipt"
                                    className="rounded-lg border p-2 text-blue-600 hover:bg-blue-50"
                                >
                                    <Download size={18} />
                                </button>

                                {/* Employee can delete receipt only for Pending claim */}
                                {!manager && claim.status === 'PENDING' && (
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteModal(true)}
                                        title="Delete receipt"
                                        className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}

                            </div>
                        )}

                    </div>
                </div>

            </section>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <ConfirmDialog
                    title="Delete receipt?"
                    message="Are you sure you want to delete this receipt? This action cannot be undone."
                    confirmText={deleting ? 'Deleting...' : 'Yes, Delete'}
                    cancelText="Cancel"
                    onConfirm={handleDeleteReceipt}
                    onCancel={() => {
                        if (!deleting) {
                            setShowDeleteModal(false);
                        }
                    }}
                    loading={deleting}
                />
            )}

        </div>
    );
}










// import { useEffect, useState } from 'react';
// import { Link, useParams } from 'react-router-dom';
// import { ArrowLeft } from 'lucide-react';
// import toast from 'react-hot-toast';
// import { Eye, Trash2 } from 'lucide-react';
// import { viewReceipt, deleteReceipt } from '../services/receiptService';
// import ConfirmDialog from '../components/ConfirmDialog';
// import useAuth from '../hooks/useAuth';
// import { getClaim, getManagerClaim } from '../services/claimService';
// import { formatCurrency } from '../utils/formatCurrency';
// import { formatDate } from '../utils/formatDate';

// export default function ClaimDetails() {
//     const { id } = useParams();
//     const { user } = useAuth();

//     const manager = user?.role === 'MANAGER';

//     const [claim, setClaim] = useState(null);
//     const [loading, setLoading] = useState(true);

//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const [deleting, setDeleting] = useState(false);

//     const handleViewReceipt = async () => {
//         try {
//             const response = await viewReceipt(id, claim.receiptId);

//             const fileUrl = URL.createObjectURL(response.data);
//             window.open(fileUrl, '_blank');

//             setTimeout(() => URL.revokeObjectURL(fileUrl), 60000);
//         } catch (error) {
//             toast.error(
//                 error.response?.data?.message || 'Unable to view receipt.'
//             );
//         }
//     };

//     const handleDeleteReceipt = async () => {
//         try {
//             setDeleting(true);

//             await deleteReceipt(id, claim.receiptId);

//             setClaim(prev => ({
//                 ...prev,
//                 receiptAttached: false,
//                 receiptId: null,
//             }));

//             setShowDeleteModal(false);
//             toast.success('Receipt deleted successfully.');
//         } catch (error) {
//             toast.error(
//                 error.response?.data?.message || 'Unable to delete receipt.'
//             );
//         } finally {
//             setDeleting(false);
//         }
//     };

//     useEffect(() => {
//         const fetchClaim = async () => {
//             try {
//                 const response = manager
//                     ? await getManagerClaim(id)
//                     : await getClaim(id);

//                 setClaim(response.data.data);
//             } catch (error) {
//                 toast.error(
//                     error.response?.data?.message ||
//                     'Unable to load claim details.'
//                 );
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchClaim();
//     }, [id, manager]);

//     if (loading) {
//         return <div className="p-6 text-center">Loading claim details...</div>;
//     }

//     if (!claim) {
//         return (
//             <div className="rounded-xl border bg-white p-8 text-center">
//                 <p className="text-red-600">
//                     Claim not found or access denied.
//                 </p>
//                 <Link to="/claims" className="mt-4 inline-block text-indigo-600">
//                     Back to claims
//                 </Link>
//             </div>
//         );
//     }

//     return (
//         <div className="mx-auto max-w-4xl space-y-6">
//             <Link
//                 to="/claims"
//                 className="inline-flex items-center gap-2 text-sm text-slate-500"
//             >
//                 <ArrowLeft size={16} />
//                 Back to claims
//             </Link>

//             <div>
//                 <p className="text-xs font-semibold uppercase text-indigo-600">
//                     {claim.id}
//                 </p>

//                 <h1 className="mt-2 text-3xl font-bold">
//                     {claim.title}
//                 </h1>

//                 <p className="mt-2 text-sm text-slate-500">
//                     Submitted by {claim.employeeName}
//                 </p>
//             </div>

//             <section className="rounded-2xl border bg-white p-6">
//                 <h2 className="font-semibold">Expense information</h2>

//                 <div className="mt-5 grid grid-cols-2 gap-5">
//                     <div>
//                         <p className="text-xs text-slate-400">Amount</p>
//                         <p className="mt-1 font-semibold">
//                             {formatCurrency(claim.amount)}
//                         </p>
//                     </div>

//                     <div>
//                         <p className="text-xs text-slate-400">Category</p>
//                         <p className="mt-1 font-semibold">
//                             {claim.categoryName}
//                         </p>
//                     </div>

//                     <div>
//                         <p className="text-xs text-slate-400">Expense date</p>
//                         <p className="mt-1 font-semibold">
//                             {formatDate(claim.expenseDate)}
//                         </p>
//                     </div>

//                     <div>
//                         <p className="text-xs text-slate-400">Status</p>
//                         <p className="mt-1 font-semibold">
//                             {claim.status}
//                         </p>
//                     </div>
//                 </div>

//                 <div className="mt-6 border-t pt-5">
//                     <p className="text-xs text-slate-400">Description</p>
//                     <p className="mt-2 text-sm text-slate-600">
//                         {claim.description || 'No description provided.'}
//                     </p>
//                 </div>

//                 {manager && (
//                     <div className="mt-6 border-t pt-5">
//                         <p className="text-xs text-slate-400">Employee email</p>
//                         <p className="mt-1 font-semibold">
//                             {claim.employeeEmail}
//                         </p>
//                     </div>
//                 )}

//                 {claim.managerComment && (
//                     <div className="mt-6 rounded-xl bg-slate-50 p-4">
//                         <p className="text-xs text-slate-400">Manager comment</p>
//                         <p className="mt-2 text-sm">{claim.managerComment}</p>
//                     </div>
//                 )}

//                 <div className="mt-6 rounded-xl border border-dashed p-4">
//                     <div className="flex items-center justify-between gap-4">
//                         <div>
//                             <p className="text-sm font-semibold">
//                                 Receipt attachment
//                             </p>

//                             <p className="mt-1 text-xs text-slate-500">
//                                 {claim.receiptAttached
//                                     ? 'Receipt is attached.'
//                                     : 'No receipt attached.'}
//                             </p>
//                         </div>


//                         {claim.receiptAttached && (
//                             <div className="flex items-center gap-2">

//                                 <button
//                                     type="button"
//                                     onClick={handleViewReceipt}
//                                     title="View receipt"
//                                     className="rounded-lg border p-2 text-indigo-600 hover:bg-indigo-50"
//                                 >
//                                     <Eye size={18} />
//                                 </button>

//                                 {!manager && claim.status === 'PENDING' && (
//                                     <button
//                                         type="button"
//                                         onClick={() => setShowDeleteModal(true)}
//                                         title="Delete receipt"
//                                         className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
//                                     >
//                                         <Trash2 size={18} />
//                                     </button>
//                                 )}

//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </section>

//             {showDeleteModal && (
//                 <ConfirmDialog
//                     title="Delete receipt?"
//                     message="Are you sure you want to delete this receipt? This action cannot be undone."
//                     confirmText={deleting ? 'Deleting...' : 'Yes, Delete'}
//                     cancelText="Cancel"
//                     onConfirm={handleDeleteReceipt}
//                     onCancel={() => setShowDeleteModal(false)}
//                     loading={deleting}
//                 />
//             )}
//         </div>
//     );
// }


