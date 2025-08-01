import { ResourceStatus } from "@/constant/resourceStatus";

const baseBadgeClass =
    "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium";

export function getResourceStatusLabel(status: number) {
    switch (status) {
        case ResourceStatus.Pending:
            return (
                <span className={`${baseBadgeClass} bg-blue-100 text-blue-800`}>
                    Pending
                </span>
            );
        case ResourceStatus.Accepted:
            return (
                <span className={`${baseBadgeClass} bg-green-100 text-green-800`}>
                    Onboarding Pending
                </span>
            );
        case ResourceStatus.Rejected:
            return (
                <span className={`${baseBadgeClass} bg-red-100 text-red-800`}>
                    Rejected
                </span>
            );
        case ResourceStatus.ResourceOnboarded:
            return (
                <span className={`${baseBadgeClass} bg-orange-100 text-orange-800`}>
                    Resource Onboarded
                </span>
            );
        case ResourceStatus.AcceptedResignation:
            return (
                <span className={`${baseBadgeClass} bg-green-100 text-green-800`}>
                    Resigned
                </span>
            );
        case ResourceStatus.ExitProcessInitiated:
            return (
                <span className={`${baseBadgeClass} bg-green-100 text-green-800`}>
                    Exit Process Initiated
                </span>
            );
        case ResourceStatus.DeActive:
            return (
                <span className={`${baseBadgeClass} bg-gray-100 text-gray-800`}>
                    Deactivated
                </span>
            );
        default:
            return (
                <span className={`${baseBadgeClass} bg-gray-200 text-gray-800`}>
                    Unknown
                </span>
            );
    }
}