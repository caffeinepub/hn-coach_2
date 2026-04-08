/**
 * StorageClient stub — provides file upload/download via object storage.
 * This is a compatibility shim; the full implementation is provided by
 * the @caffeineai/object-storage package when available.
 */
import type { HttpAgent } from "@icp-sdk/core/agent";

export class StorageClient {
  private storageGatewayUrl: string;
  private bucketName: string;
  private canisterId: string;
  private projectId: string;
  private agent: HttpAgent;

  constructor(
    bucketName: string,
    storageGatewayUrl: string,
    canisterId: string,
    projectId: string,
    agent: HttpAgent,
  ) {
    this.bucketName = bucketName;
    this.storageGatewayUrl = storageGatewayUrl;
    this.canisterId = canisterId;
    this.projectId = projectId;
    this.agent = agent;
  }

  async putFile(bytes: Uint8Array): Promise<{ hash: string }> {
    const url = `${this.storageGatewayUrl}/upload`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "X-Bucket": this.bucketName,
        "X-Project": this.projectId,
      },
      body: bytes as unknown as BodyInit,
    });
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }
    const data = await response.json();
    return { hash: data.hash ?? data.id ?? "" };
  }

  async getDirectURL(blobId: string): Promise<string> {
    return `${this.storageGatewayUrl}/file/${this.bucketName}/${blobId}`;
  }
}
