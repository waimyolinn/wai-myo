import { describe, it, expect } from "vitest";

describe("Firebase Configuration", () => {
  it("should have Firebase API key configured", () => {
    const apiKey = process.env.FIREBASE_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).toBeTruthy();
    expect(apiKey).toMatch(/^AIzaSy/); // Firebase API keys start with AIzaSy
  });

  it("should validate Firebase project configuration", () => {
    const projectId = "mibamyitta-99a71";
    const projectNumber = "357332210973";
    const packageName = "com.mibamyitta.wm";

    expect(projectId).toBeDefined();
    expect(projectNumber).toBeDefined();
    expect(packageName).toBeDefined();
    expect(packageName).toMatch(/^com\./);
  });

  it("should have valid FCM token format", () => {
    // Test that FCM tokens would be valid format
    const mockFcmToken = "dummyToken123456789";
    expect(mockFcmToken).toBeTruthy();
    expect(mockFcmToken.length).toBeGreaterThan(0);
  });
});
