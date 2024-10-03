"use client";
import React from "react";
import { useState } from "react";
import {
  Center,
  Tooltip,
  UnstyledButton,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconAlignJustified,
  
  IconLogout,
  IconSwitchHorizontal,
} from "@tabler/icons-react";
// import { MantineLogo } from '@mantinex/mantine-logo';
import classes from "./NavbarMinimal.module.css";


const toolsData = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-prism-light"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M4.731 19h11.539a1 1 0 0 0 .866 -1.5l-5.769 -10a1 1 0 0 0 -1.732 0l-5.769 10a1 1 0 0 0 .865 1.5" />
        <path d="M2 13h4.45" />
        <path d="M18 5l-4.5 6" />
        <path d="M22 9l-7.75 3.25" />
        <path d="M22 15l-7 -1.5" />
      </svg>
    ),
    label: "Remover",
    href: "/sdfsa",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-prism-light"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M4.731 19h11.539a1 1 0 0 0 .866 -1.5l-5.769 -10a1 1 0 0 0 -1.732 0l-5.769 10a1 1 0 0 0 .865 1.5" />
        <path d="M2 13h4.45" />
        <path d="M18 5l-4.5 6" />
        <path d="M22 9l-7.75 3.25" />
        <path d="M22 15l-7 -1.5" />
      </svg>
    ),
    label: "Splitter",
    href: "/splitter-ai",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-menorah"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 4v16" />
        <path d="M8 4v2a4 4 0 1 0 8 0v-2" />
        <path d="M4 4v2a8 8 0 1 0 16 0v-2" />
        <path d="M10 20h4" />
      </svg>
    ),
    label: "Pitcher",
    href: "/pitch",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-metronome"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M14.153 8.188l-.72 -3.236a2.493 2.493 0 0 0 -4.867 0l-3.025 13.614a2 2 0 0 0 1.952 2.434h7.014a2 2 0 0 0 1.952 -2.434l-.524 -2.357m-4.935 1.791l9 -13" />
        <path d="M20 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
      </svg>
    ),
    label: "Key BPM Finder",
    href: "/key-bpm-finder",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-cut"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M7 17m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
        <path d="M17 17m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
        <path d="M9.15 14.85l8.85 -10.85" />
        <path d="M6 4l8.85 10.85" />
      </svg>
    ),
    label: "Cutter",
    href: "/",
    active: true,
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-merge-alt-left"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M8 7l4 -4l4 4" />
        <path d="M18 21v.01" />
        <path d="M18 18.01v.01" />
        <path d="M17 15.02v.01" />
        <path d="M14 13.03v.01" />
        <path d="M12 3v5.394a6.737 6.737 0 0 1 -3 5.606a6.737 6.737 0 0 0 -3 5.606v1.394" />
      </svg>
    ),
    label: "Joiner",
    href: "/joiner",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-microphone"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z" />
        <path d="M5 10a7 7 0 0 0 14 0" />
        <path d="M8 21l8 0" />
        <path d="M12 17l0 4" />
      </svg>
    ),
    label: "Recorder",
    href: "/voice-recorder",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="icon icon-tabler icons-tabler-outline icon-tabler-disc"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
        <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
        <path d="M7 12a5 5 0 0 1 5 -5" />
        <path d="M12 17a5 5 0 0 0 5 -5" />
      </svg>
    ),
    label: "Karaoke",
    href: "/karaoke",
  },
];

export function NavbarMinimal() {
  const [active, setActive] = useState(
    toolsData.findIndex((tool) => tool.active)
  );

  const links = toolsData.map((link, index) => (
    <div key={link.label} className={classes.linkWrapper}>
      <UnstyledButton
        onClick={() => {
          setActive(index);
        }}
        className={`${classes.link} ${
          index === active ? classes.activeLink : ""
        }`}
      >
        {link.icon}
        <Text size="sm">{link.label}</Text>
      </UnstyledButton>
    </div>
  ));

  const bottomLinks = [
    { icon: <IconSwitchHorizontal />, label: "Change account" },
    { icon: <IconLogout />, label: "Logout" },
  ];

  return (
    <nav className={classes.navbar}>
      <Center p="1rem">
        <IconAlignJustified size={24} />
      </Center>

      <div className={classes.navbarMain}>
        <Stack justify="center" gap={0}>
          {links}
        </Stack>
      </div>

      <Stack
        justify="center"
        gap={0}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {bottomLinks.map((link) => (
          <Tooltip
        
            key={link.label}
            label={link.label}
            position="left"
            transitionProps={{ duration: 0 }}
          >
            <UnstyledButton
              onClick={() => {
                /* Add your onClick logic here */
              }}
              className={classes.link}
            >
              {link.icon}
              <Text size="sm">{link.label}</Text>
            </UnstyledButton>
          </Tooltip>
        ))}
      </Stack>
    </nav>
  );
}
