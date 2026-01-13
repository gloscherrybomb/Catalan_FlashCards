import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { logger } from '../../services/logger';

interface WaveformVisualizerProps {
  isActive: boolean;
  className?: string;
  barCount?: number;
  color?: string;
}

export function WaveformVisualizer({
  isActive,
  className = '',
  barCount = 32,
  color = 'currentColor',
}: WaveformVisualizerProps) {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [dataArray, setDataArray] = useState<Uint8Array | null>(null);
  const animationRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isActive && !audioContext) {
      initAudio();
    } else if (!isActive && audioContext) {
      cleanup();
    }

    return () => {
      cleanup();
    };
  }, [isActive]);

  useEffect(() => {
    if (isActive && analyser && dataArray) {
      draw();
    } else {
      cancelAnimationFrame(animationRef.current);
    }
  }, [isActive, analyser, dataArray]);

  const initAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const context = new AudioContext();
      const source = context.createMediaStreamSource(stream);
      const analyserNode = context.createAnalyser();

      analyserNode.fftSize = 64;
      analyserNode.smoothingTimeConstant = 0.8;

      source.connect(analyserNode);

      const bufferLength = analyserNode.frequencyBinCount;
      const data = new Uint8Array(bufferLength);

      setAudioContext(context);
      setAnalyser(analyserNode);
      setDataArray(data);
    } catch (error) {
      logger.error('Error initializing audio', 'WaveformVisualizer', { error: String(error) });
    }
  };

  const cleanup = () => {
    cancelAnimationFrame(animationRef.current);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
    }

    setAnalyser(null);
    setDataArray(null);
  };

  const draw = () => {
    if (!canvasRef.current || !analyser || !dataArray) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = canvas.width / barCount;
    const gap = 2;
    const centerY = canvas.height / 2;

    for (let i = 0; i < barCount; i++) {
      // Map data array index to bar index
      const dataIndex = Math.floor(i * (dataArray.length / barCount));
      const value = dataArray[dataIndex] / 255;

      // Make center bars taller
      const centerFactor = 1 - Math.abs(i - barCount / 2) / (barCount / 2);
      const height = Math.max(4, value * (canvas.height * 0.8) * (0.5 + centerFactor * 0.5));

      const x = i * barWidth + gap / 2;
      const barActualWidth = barWidth - gap;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, centerY - height / 2, barActualWidth, height, 2);
      ctx.fill();
    }

    animationRef.current = requestAnimationFrame(draw);
  };

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={300}
        height={60}
        className="w-full h-full"
      />
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center gap-1">
          {Array.from({ length: barCount }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full"
              style={{ backgroundColor: color }}
              initial={{ height: 4 }}
              animate={{ height: 4 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Simpler bar-based visualizer without audio analysis
export function SimpleWaveform({
  isActive,
  className = '',
  barCount = 5,
}: {
  isActive: boolean;
  className?: string;
  barCount?: number;
}) {
  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-current"
          animate={
            isActive
              ? {
                  height: [8, 24, 8],
                }
              : { height: 8 }
          }
          transition={
            isActive
              ? {
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeInOut',
                }
              : { duration: 0.2 }
          }
        />
      ))}
    </div>
  );
}
