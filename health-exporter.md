---
title: "Health Exporter Case Study | Parmis Meshgi"
description: "Health Exporter is a user-controlled Apple Health export tool, designed by product designer Parmis Meshgi."
canonical_url: "https://meshgi.com/health-exporter/"
html_url: "https://meshgi.com/health-exporter/"
author: "Parmis Meshgi"
location: "Toronto, Canada"
language: "en-CA"
last_updated: "2026-09-29"
---

> Health Exporter is a user-controlled Apple Health export tool, designed by product designer Parmis Meshgi.

Canonical page: [https://meshgi.com/health-exporter/](https://meshgi.com/health-exporter/)

[← Side projects](https://meshgi.com/playground/)

Independent product · iOS

# Health
Exporter

Move the Apple Health data you choose, on your terms.

[Open on the App Store ↗](https://apps.apple.com/ca/app/health-exporter/id6788438912)

![Health Exporter app icon](https://meshgi.com/assets/playground/health-exporter.jpg)

![Health Exporter data selection and export screen](https://meshgi.com/assets/playground/health-screen-1.jpg)

My role Product and UX design

Information flow, interface, and release story

Platform iPhone and iPad

Apple Health export utility

Release August 4, 2026

Version 1.0

Core value Controlled transfer

With explicit data choices

Project value

## Give people a clear route out of a closed health-data system.

### What the design needed to achieve

- ✓

Let users choose data before the app requests access.

- ✓

Support a local file and a personal server destination.

- ✓

Keep sensitive transfer choices visible and reversible.

Problem

### Health data stays trapped.

Useful records become hard to reuse when export controls are broad or unclear.

Risk

### Access can exceed need.

A health utility can request more data or storage than the task requires.

Direction

### Show every transfer step.

Place selection, permission, destination, and file review in a clear order.

Design decisions

## Make sensitive data movement understandable.

01

### Select data before access

Purpose first

Users choose the Health data types they need before the related read permission appears.

Intended impact

Connect each permission request to a visible purpose.

02

### Offer two clear destinations

Flexible ownership

The product creates a ZIP file or sends JSON batches to the user’s own HTTPS webhook.

Intended impact

Support a simple file flow and a repeatable personal sync flow.

03

### Make exports inspectable

Transparent output

A documented JSON schema, manifest, and sample batches make the output easier to understand.

Intended impact

Reduce uncertainty before the data enters another system.

04

### Avoid a bundled service

Privacy boundary

The app has no account, analytics, ads, tracking, or bundled backend. Users can review and delete stored ZIP files.

Intended impact

Keep control with the person who owns the data.

Product proof

## The interface shows what moves and where it goes.

![Health Exporter main export screen](https://meshgi.com/assets/playground/health-screen-1.jpg)

Export

The range, selected data, access, and file action share one screen.

![Health Exporter personal webhook settings](https://meshgi.com/assets/playground/health-screen-2.jpg)

Destination

A personal webhook stays separate from local file export.

![Health Exporter data type selection](https://meshgi.com/assets/playground/health-screen-3.jpg)

Data types

Search and selection happen before Health access.

Result

## A direct health-data utility reached the App Store.

Released evidence

### Public iOS product

Health Exporter launched for iPhone and iPad on August 4, 2026.

Verified boundary

### No bundled account

The public product states no accounts, analytics, ads, tracking, or bundled backend.

Measure next

### Transfer signals

Track completed exports, retry recovery, deleted files, and webhook errors. Public results are not yet available.

[Released product Open Health Exporter on the App Store ↗](https://apps.apple.com/ca/app/health-exporter/id6788438912)

[Next side quest Family Tree →](https://meshgi.com/family-tree/)
