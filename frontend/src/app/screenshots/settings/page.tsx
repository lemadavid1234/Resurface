import { getCurrentUser } from "../getCurrentUser";
import LogOutButton from "../LogOutButton";
import SidebarToggleButton from "../sidebar/SidebarToggleButton";


export default async function SettingsPage() {

    const user = await getCurrentUser();

    return (
        <div>
            <div className="p-4 border-b border-gray-200">
                <SidebarToggleButton />
            </div>  

            <div className="p-4 max-w-md flex flex-col gap-6">
                <h1 className="text-lg font-bold">Settings</h1>

                <div>
                    <p className="text-xs uppercase text-gray-500 mb-1">Account</p>
                    <p className="text-sm text-gray-700">{user.email}</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <LogOutButton />
                </div>
            </div>
        </div>
    )
}