declare module "ml5" {
  interface PitchDetector {
    getPitch(callback: (err: Error | null, frequency: number | null) => void): void;
  }

  function pitchDetection(
    modelPath: string,
    audioContext: AudioContext,
    stream: MediaStream,
    callback: () => void
  ): PitchDetector;

  export { pitchDetection };
  export default { pitchDetection };
}
