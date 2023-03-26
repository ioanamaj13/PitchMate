import {
  convWidthForNumBins,
  getBinWidth,
  ithBinToFreq,
  makeOptimalQuadraticBinsForSamples,
} from "../math/convolution";
import { makeInvLogFn } from "../math/invLog";

export const FFT_SIZE = 2048;
export const SAMPLING_RATE = 44100;
export const N_SAMPLES_TO_PROCESS = 512;
export const NUM_BINS = 12;
export const LOG_COEFF = 20;
export const BIN_WIDTH = getBinWidth(SAMPLING_RATE, FFT_SIZE);
export const SAMPLE_SIZE_MS = 150;

export const calculateBins = makeOptimalQuadraticBinsForSamples(
  NUM_BINS,
  N_SAMPLES_TO_PROCESS,
  LOG_COEFF
);

export const DISPLAY_BIN_WIDTH =
  convWidthForNumBins(NUM_BINS, N_SAMPLES_TO_PROCESS) * BIN_WIDTH;
export const invLog = makeInvLogFn(LOG_COEFF, N_SAMPLES_TO_PROCESS);
export const FIRST_BIN_FREQ = ithBinToFreq(BIN_WIDTH)(invLog(LOG_COEFF));
export const MAX_BIN_FREQ = BIN_WIDTH * N_SAMPLES_TO_PROCESS;
