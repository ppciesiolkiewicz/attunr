import { Capacitor } from "@capacitor/core";

/** Whether the app is running inside a native Capacitor shell (iOS/Android). */
export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

export function isIOS(): boolean {
  return Capacitor.getPlatform() === "ios";
}

export function isAndroid(): boolean {
  return Capacitor.getPlatform() === "android";
}

export function isWeb(): boolean {
  return !isNative();
}
