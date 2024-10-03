import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Button,
  Group,
  Text,
  ActionIcon,
  Select,
  Paper,
} from "@mantine/core";
import {
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconTrash,
  IconPlayerSkipBackFilled,
  IconCut,
  IconCornerUpLeft,
  IconCornerUpRight,
  IconChevronUp,
  IconChevronDown,
} from "@tabler/icons-react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";
import "./wavefrom.css";
import { AudioContext } from "standardized-audio-context";
import audioBufferToWav from "audiobuffer-to-wav";

interface Region {
  start: number;
  end: number;
  color: string;
  drag: boolean;
  resize: boolean;
  element?: HTMLElement;
  setOptions: (options: Partial<Region>) => void;
}

interface WaveformEditorProps {
  audioFile: File;
  onSave: (blob: Blob, fileName: string) => void;
}

export default function WaveformEditor({ audioFile }: WaveformEditorProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [format, setFormat] = useState("mp3");
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const regionsPluginRef = useRef<RegionsPlugin | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [history, setHistory] = useState<
    { buffer: ArrayBuffer; start: number; end: number; duration: number }[]
  >([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const addToHistory = useCallback(
    (buffer: ArrayBuffer, start: number, end: number, duration: number) => {
      setHistory((prev) => [
        ...prev.slice(0, historyIndex + 1),
        { buffer, start, end, duration },
      ]);
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  const cutAudio = useCallback(() => {
    if (wavesurfer.current && regionsPluginRef.current) {
      const region = regionsPluginRef.current.getRegions()[0];
      if (region) {
        const start = region.start;
        const end = region.end;

        // Update the region using its own methods
        region.setOptions({ start, end });
        wavesurfer.current.setTime(start);

        // Create a new audio buffer with the selected region
        const originalBuffer = wavesurfer.current.getDecodedData();
        if (originalBuffer) {
          // Add current state to history before cutting
          addToHistory(
            originalBuffer.getChannelData(0).buffer,
            startTime,
            endTime,
            duration
          );

          const newBuffer = createTrimmedBuffer(originalBuffer, start, end);

          // Convert the new buffer to a Blob
          const wavBlob = bufferToWaveBlob(newBuffer);

          // Load the new Blob into WaveSurfer
          wavesurfer.current.loadBlob(wavBlob);

          // Update state
          setStartTime(0);
          setEndTime(newBuffer.duration);
          setDuration(newBuffer.duration);
        }
      }
    }
  }, [addToHistory, startTime, endTime, duration]);

  const createTrimmedBuffer = (
    originalBuffer: AudioBuffer,
    start: number,
    end: number
  ) => {
    const sampleRate = originalBuffer.sampleRate;
    const startSample = Math.floor(start * sampleRate);
    const endSample = Math.floor(end * sampleRate);
    const newLength = endSample - startSample;

    const newBuffer = new AudioContext().createBuffer(
      originalBuffer.numberOfChannels,
      newLength,
      sampleRate
    );

    for (
      let channel = 0;
      channel < originalBuffer.numberOfChannels;
      channel++
    ) {
      const newChannelData = newBuffer.getChannelData(channel);
      const originalChannelData = originalBuffer.getChannelData(channel);
      for (let i = 0; i < newLength; i++) {
        newChannelData[i] = originalChannelData[startSample + i];
      }
    }

    return newBuffer;
  };

  const bufferToWaveBlob = (audioBuffer: AudioBuffer): Blob => {
    const wavArrayBuffer = audioBufferToWav(audioBuffer);
    return new Blob([wavArrayBuffer], { type: "audio/wav" });
  };

  useEffect(() => {
    if (waveformRef.current) {
      const regionsPlugin = RegionsPlugin.create();
      regionsPluginRef.current = regionsPlugin;

      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#00FF8E",
        progressColor: "#144435",
        cursorColor: "#FFFFFF",
        barWidth: 2,
        barHeight: 1,
        height: 150,
        plugins: [regionsPlugin],
      });

      wavesurfer.current.on("ready", () => {
        if (wavesurfer.current) {
          const audioDuration = wavesurfer.current.getDuration();
          setDuration(audioDuration);
          setEndTime(audioDuration);

          const initialRegion = regionsPlugin.addRegion({
            start: 0,
            end: audioDuration,
            color: "rgba(0, 0, 0, 0.2)",
            drag: false,
            resize: false,
          });
        //   @ts-ignore
          setRegions([initialRegion]);

          if (initialRegion.element) {
            initialRegion.element.part.add("active-region");
          }
        }
      });

      regionsPlugin.on("region-updated", (region) => {
        setStartTime(region.start);
        setEndTime(region.end);
      });

      // Add this new event listener
      regionsPlugin.on("region-created", (region) => {
        region.setOptions({ start: region.start, drag: true, resize: true });
      });

      wavesurfer.current.on("play", () => setIsPlaying(true));
      wavesurfer.current.on("pause", () => setIsPlaying(false));

      return () => {
        if (wavesurfer.current) {
          wavesurfer.current.destroy();
        }
      };
    }
  }, []);

  useEffect(() => {
    if (wavesurfer.current) {
      wavesurfer.current.loadBlob(audioFile);
    }
  }, [audioFile]);

  const handlePlayPause = useCallback(() => {
    if (wavesurfer.current) {
      if (isPlaying) {
        wavesurfer.current.pause();
      } else {
        wavesurfer.current.setTime(startTime);
        wavesurfer.current.play();
      }
    }
  }, [isPlaying, startTime]);

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const tenths = Math.floor((time % 1) * 10);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${tenths}`;
  };

  const updateRegion = useCallback(
    (start: number, end: number) => {
      if (regions.length > 0 && regionsPluginRef.current) {
        const region = regions[0];
        region.setOptions({ start, end });
        setStartTime(start);
        setEndTime(end);

        if (region.element) {
          region.element.part.add("active-region");
        }
      }
    },
    [regions]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setHistoryIndex((prev) => prev - 1);

      if (wavesurfer.current) {
        const audioContext = new AudioContext();
        audioContext.decodeAudioData(
          previousState.buffer.slice(0),
          (audioBuffer) => {
            const wavBlob = bufferToWaveBlob(audioBuffer);
            wavesurfer.current?.loadBlob(wavBlob);

            // Update state
            setStartTime(previousState.start);
            setEndTime(previousState.end);
            setDuration(previousState.duration);

            // Update region
            if (regionsPluginRef.current) {
              const region = regionsPluginRef.current.getRegions()[0];
              if (region) {
                region.setOptions({
                  start: previousState.start,
                  end: previousState.end,
                });
              }
            }
          }
        );
      }
    }
  }, [history, historyIndex]);

  return (
    <>
      <Paper
        style={{
          backgroundColor: "#17171E",
          color: "white",
          width: "90%",
          height: "100%",
        }}
      >
        <Box mb="md">
          <Text ta="right" size="sm" color="dimmed">
            {audioFile.name}
          </Text>
        </Box>
        <Box ref={waveformRef} style={{ backgroundColor: "#2C2C2E" }} />
        <Group justify="space-between" mt="sm" w="100%">
          <Text size="sm">{formatTime(startTime)}</Text>
          <Text size="sm">{formatTime(endTime)}</Text>
        </Group>
        <Group justify="right" mt="md">
          <Group>
            <Button
              variant="subtle"
              color="white"
              bg="#262633"
              onClick={cutAudio}
            >
              <IconCut size={18} />
              <Text size="sm">Cut</Text>
            </Button>
            <Button variant="subtle" color="white" bg="#262633">
              <IconTrash size={18} />
              <Text size="sm">Remove</Text>
            </Button>
          </Group>
          <Group>
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={undo}
              disabled={historyIndex <= 0}
            >
              <IconCornerUpLeft size={18} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="gray">
              <IconCornerUpRight size={18} />
            </ActionIcon>
          </Group>
        </Group>
        <Group
          justify="space-between"
          mt="xl"
          display="flex"
          bottom="0"
          p="1rem"
          w="90%"
          style={{ position: "absolute", bottom: "0" }}
        >
          <Group>
            <Button
              variant="subtle"
              color="gray"
              onClick={handlePlayPause}
              radius="xl"
              styles={(theme) => ({
                root: {
                  backgroundColor: theme.colors.dark[7],
                  width: "6rem",
                  height: "3rem",
                  "&:hover": {
                    backgroundColor: theme.colors.dark[5],
                  },
                },
              })}
            >
              {isPlaying ? (
                <IconPlayerPauseFilled size={18} />
              ) : (
                <IconPlayerPlayFilled size={18} />
              )}
            </Button>
            <ActionIcon variant="subtle" color="gray">
              <IconPlayerSkipBackFilled size={18} />
            </ActionIcon>
          </Group>

          <Group>
            <Group gap="xs">
              <Text size="sm" mr="xs">
                Start:
              </Text>
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "55px",
                  width: "100px",
                  justifyContent: "center",
                  border: "1px solid #25262b",
                }}
                bg="none"
                p="5px"
              >
                <input
                  type="number"
                  value={startTime.toFixed(2)}
                  onChange={(e) => {
                    const newTime = Math.max(
                      0,
                      Math.min(parseFloat(e.target.value), endTime)
                    );
                    updateRegion(newTime, endTime);
                  }}
                  step="0.1"
                  min="0"
                  max={endTime}
                  style={{
                    borderRadius: "55px",
                    color: "white",
                    border: "none",
                    padding: "5px",
                    textAlign: "center",
                  }}
                />
                <Box style={{ display: "flex", flexDirection: "column" }}>
                  <ActionIcon
                    size="xs"
                    bg="none"
                    onClick={() => {
                      const newTime = Math.min(startTime + 0.1, endTime);
                      updateRegion(newTime, endTime);
                    }}
                  >
                    <IconChevronUp size={16} />
                  </ActionIcon>
                  <ActionIcon
                    size="xs"
                    bg="none"
                    onClick={() => {
                      const newTime = Math.max(startTime - 0.1, 0);
                      updateRegion(newTime, endTime);
                    }}
                  >
                    <IconChevronDown size={16} />
                  </ActionIcon>
                </Box>
              </Box>
            </Group>
            <Group gap="xs">
              <Text size="sm" mr="xs">
                End:
              </Text>
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "55px",
                  width: "100px",
                  justifyContent: "center",
                  border: "1px solid #25262b",
                }}
                bg="none"
                p="5px"
              >
                <input
                  type="text"
                  value={formatTime(endTime)}
                  onChange={(e) => {
                    const [minutes, seconds] = e.target.value.split(":");
                    const [wholeSecs, tenths] = seconds.split(".");
                    const newTime =
                      parseInt(minutes) * 60 +
                      parseInt(wholeSecs) +
                      parseInt(tenths) / 10;
                    updateRegion(startTime, Math.min(newTime, duration));
                  }}
                  style={{
                    borderRadius: "55px",
                    color: "white",
                    border: "none",
                    padding: "5px",
                    backgroundColor: "transparent",
                    textAlign: "center",
                    width: "70px", // Adjust as needed
                  }}
                />
                <Box style={{ display: "flex", flexDirection: "column" }}>
                  <ActionIcon
                    size="xs"
                    bg="none"
                    onClick={() => {
                      const newTime = Math.min(endTime + 0.1, duration);
                      updateRegion(startTime, newTime);
                    }}
                  >
                    <IconChevronUp size={16} />
                  </ActionIcon>
                  <ActionIcon
                    size="xs"
                    bg="none"
                    onClick={() => {
                      const newTime = Math.max(endTime - 0.1, startTime);
                      updateRegion(startTime, newTime);
                    }}
                  >
                    <IconChevronDown size={16} />
                  </ActionIcon>
                </Box>
              </Box>
            </Group>
          </Group>

          <Group>
            <Group gap="xs" align="center">
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "55px",
                  border: "1px solid black",
                  overflow: "hidden",
                  width: "180px",
                  backgroundColor: "#262633",
                }}
              >
                <Text
                  size="sm"
                  mr="xs"
                  style={{ color: "white", paddingLeft: "15px" }}
                >
                  Format:
                </Text>
                <Select
                  value={format}
                  onChange={(value) => setFormat(value as string)}
                  data={[
                    { value: "mp3", label: "mp3" },
                    { value: "wav", label: "wav" },
                  ]}
                  styles={(theme) => ({
                    root: {
                      flex: 1,
                    },
                    input: {
                      color: format === "mp3" ? "#00FF8E" : "#00FF8E",
                      border: "none",
                      backgroundColor: "transparent",
                      paddingLeft: "5px",
                    },
                    item: {
                      "&[data-selected]": {
                        "&, &:hover": {
                          backgroundColor: theme.colors.dark[7],
                          color: "#00FF8E",
                        },
                      },
                    },
                    dropdown: {
                      backgroundColor: theme.colors.dark[7],
                    },
                  })}
                />
              </Box>
            </Group>
            <Button variant="filled" color="gray" radius="xl">
              Save
            </Button>
          </Group>
        </Group>
      </Paper>
    </>
  );
}
