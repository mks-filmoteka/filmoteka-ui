import {beforeEach, describe, expect, it, vi, type Mock} from "vitest";
import {mediaClient} from "../../../shared/api/client";
import type {MediaFile} from "../types/mediaFile";
import {deleteFile, getFileUrl, uploadFile} from "./mediaApi";

vi.mock("../../../shared/api/client", () => ({
    mediaClient: {
        post: vi.fn(),
        delete: vi.fn()
    }
}));

const mockedMediaClient = mediaClient as unknown as {
    post: Mock;
    delete: Mock;
};

const mediaFile: MediaFile = {
    fileName: "test-file.jpg",
    url: "http://localhost:8081/api/v1/media/files/test-file.jpg"
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("mediaApi", () => {
    it("uploads a file as form data and unwraps the response", async () => {
        const file = new File(["test content"], "test-file.jpg", {type: "image/jpeg"});
        mockedMediaClient.post.mockResolvedValue({data: mediaFile});

        await expect(uploadFile(file)).resolves.toBe(mediaFile);

        expect(mockedMediaClient.post).toHaveBeenCalledWith("/media/files", expect.any(FormData));
        const formData = mockedMediaClient.post.mock.calls[0][1] as FormData;
        expect(formData.get("file")).toBe(file);
    });

    it("builds file URLs from file names", () => {
        expect(getFileUrl("test-file.jpg"))
            .toBe("http://localhost:8081/api/v1/media/files/test-file.jpg");
    });

    it("deletes a file by name and returns the response body", async () => {
        mockedMediaClient.delete.mockResolvedValue({data: {deleted: true}});

        await expect(deleteFile("test-file.jpg")).resolves.toEqual({deleted: true});

        expect(mockedMediaClient.delete).toHaveBeenCalledWith("/media/files/test-file.jpg");
    });
});
