import { useAuth0 } from "@auth0/auth0-react";
import { useAuthToken } from "../AuthTokenContext";

export default function AuthDebugger() {
  const { user } = useAuth0();
  const { accessToken } = useAuthToken();

  return (
    <div className="flex flex-col p-4 space-y-4 bg-gray-100 dark:bg-gray-800">
      <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg p-4">
        <p className="font-semibold text-lg">Access Token:</p>
        <pre className="text-sm overflow-auto">{JSON.stringify(accessToken, null, 2)}</pre>
      </div>
      <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg p-4">
        <p className="font-semibold text-lg">User Info:</p>
        <pre className="text-sm overflow-auto">{JSON.stringify(user, null, 2)}</pre>
      </div>
    </div>
  );
}
