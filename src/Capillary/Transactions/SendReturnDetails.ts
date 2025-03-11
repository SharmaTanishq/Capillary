import { getReturnDetailsById } from "../../KIBO/ReturnDetails";

export async function sendReturnDetails(returnId: string) {
    const returnDetails = await getReturnDetailsById(returnId);

    if(!returnDetails){
        return {
            success: false,
            message: "Return not found"
        }
    }
    
}