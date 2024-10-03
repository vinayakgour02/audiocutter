"use client";
import { useState } from "react";
import { Container, Title, Text, Stack, Group, Button } from "@mantine/core";
import WaveformEditor from "@/components/WaveformEditor";

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  return (
    <Container fluid  px="2rem" bg="#17171E" h="100vh" py="10rem">
      <Stack gap="lg" align="center">
        {!audioFile ? (
          <Stack gap="lg" align="center">
            <Group gap="md" justify="center">
              <Text c="white" size="md" fw={700}>
                How it works
              </Text>
              <Text c="white" size="md" fw={700}>
                Joiner
              </Text>
            </Group>
            <Title order={1} c="white" size="3rem">
              Audio Cutter
            </Title>
            <Text c="white" size="lg">
              Free editor to trim and cut any audio file online
            </Text>

            <Button
              component="label"
              variant="outline"
              color="white"
              size="lg"
              radius="10rem"
              styles={(theme) => ({
                root: {
                  borderColor: "#665DC3",
                },
              })}
            >
              Browse my files
              <input
                type="file"
                accept="audio/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </Button>
          </Stack>
        ) : (
          <WaveformEditor
            audioFile={audioFile}
            onSave={() => setAudioFile(null)}
            onReset={() => setAudioFile(null)}
          />
        )}
      </Stack>
    </Container>
  );
}
