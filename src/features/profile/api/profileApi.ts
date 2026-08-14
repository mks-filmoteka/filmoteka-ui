import {userClient} from "../../../shared/api/client.ts";

export async function getProfile() {
    const response = await userClient.get("/profile");
    return response.data;
}