import api from './api';

// View receipt
export const viewReceipt = (claimId, receiptId) => {
    return api.get(
        `/claims/${claimId}/receipts/${receiptId}`,
        { responseType: 'blob' }
    );
};

// Download receipt
export const downloadReceipt = (claimId, receiptId) => {
    return api.get(
        `/claims/${claimId}/receipts/${receiptId}`,
        { responseType: 'blob' }
    );
};

// Delete receipt
export const deleteReceipt = (claimId, receiptId) => {
    return api.delete(
        `/claims/${claimId}/receipts/${receiptId}`
    );
};

export const uploadReceipt = (claimId, file) => {
  const body = new FormData()

  body.append('file', file)

  return api.post(`/claims/${claimId}/receipts`, body)
}
