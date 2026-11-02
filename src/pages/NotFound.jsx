
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center text-center">
      <div>
        <p className="text-6xl font-black text-indigo-600">
          404
        </p>

        <h1 className="mt-3 text-2xl font-bold">
          Page not found
        </h1>

        <Link
          className="mt-5 inline-block text-indigo-600"
          to="/dashboard"
        >
          Return to dashboard
        </Link>
      </div>
    </div>
  )
}
