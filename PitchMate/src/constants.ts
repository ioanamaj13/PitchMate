import { getBinWidth, makeOptimalQuadraticBinsForSamples } from "./math/convolution";

export const FFT_SIZE = 2048;
export const SAMPLING_RATE = 44100;
export const N_SAMPLES_TO_PROCESS = 256;
export const NUM_BINS = 10;
export const LOG_COEFF = 20;
export const BIN_WIDTH = getBinWidth(SAMPLING_RATE, FFT_SIZE);

export const calculateBins = makeOptimalQuadraticBinsForSamples(
    NUM_BINS,
    N_SAMPLES_TO_PROCESS,
    LOG_COEFF
  );
