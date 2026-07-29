# Hardware Design Document (HDD) — Simulator-to-Device Contract

## Current scope

The MVP does not include real ESP32 firmware. The **Simulator Panel** in the dashboard produces SOS alerts using the same data contract that a real device will use in Phase 2.

## SOS ingest contract

Any device (simulator or real) that wants to create an alert must POST to `ingestSos` with an HMAC-SHA256 signature:

```ts
interface SosIngestPayload {
  deviceId: string;             // provisioned device key id
  vehicleId: string;
  tripId: string;
  location: { lat: number; lng: number; accuracyM?: number };
  triggeredAt: string;          // ISO 8601
  batteryPct?: number;
  signalDbm?: number;
  signature: string;            // HMAC-SHA256(canonical, DEVICE_KEY_HMAC_SECRET)
}

// canonical = `${deviceId}|${vehicleId}|${location.lat}|${location.lng}|${triggeredAt}`
```

## Future real-device checklist

| Subsystem | Real-device spec (Phase 2) | Simulator equivalent |
|---|---|---|
| ESP32-CAM + OV2640 | 2MP low-light camera, MJPEG stream | Pre-recorded clip uploaded as chunks |
| INMP441 I2S mic | 16 kHz mono PCM | Generated WAV placeholder |
| NEO-6M GPS | UART NMEA, 1 Hz | Script-driven lat/lng walking a polyline |
| SIM800L GSM | Fallback uplink | Always online in demo |
| Hidden tactile button | GPIO interrupt, 3 s long-press | Button click in Sim Panel |
| Li-ion + buck converter | 4 h backup | N/A |
| AES-256 on-device | Encrypt payload pre-Tx | Skipped — TLS covers transport |

## Drop-in guarantee

A real ESP32 firmware that implements the single `ingestSos` contract can replace the simulator with **zero backend, dashboard, or schema changes**.
