import { useRouter } from "next/navigation"; //imported purely so its return type can be extracted below, never actually called

//shared piece of memory every call to scheduleGridRefresh reads and writes
//let (not const) because it gets reassigned everytime this function runs
//type: setTimeout()'s return value is a number in a browser but a Timeout object in Node
let refreshTimeout: ReturnType<typeof setTimeout> | null = null;

export function scheduleGridRefresh(router: ReturnType<typeof useRouter>) {
    //"if something is currently scheduled and hasn't fired yet, cancel it"
    //coalescing step: it throws away the previous pending refresh in favor of a new one, rather than letting both fire eventually
    if (refreshTimeout) {
        clearTimeout(refreshTimeout);
    }

    //schedule a new refresh 500ms from now, and remember its ID (so a future call can cancel it if needed)
    //when it actually fires: do the real refresh, then reset refreshTimeout back to null
    //because at that point nothing is pending anymore, and the variables whole job is to
    //accurately answer "is a refresh currently waiting to happen?"
    refreshTimeout = setTimeout(() => {
        router.refresh();
        refreshTimeout = null;
    }, 500);
}