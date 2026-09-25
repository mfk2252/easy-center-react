# Sentinel Security Journal

## 2025-05-18 - File Upload Validation Defense
**Vulnerability:** File upload forms allow users to upload arbitrary files which could pose risks if unsafe file types or oversized payloads are processed.
**Learning:** Client-side validation in `src/utils/fileUpload.js` enforces strict MIME type checks (whitelisting image/pdf/doc types and blocking video MIME types) and file size caps (2MB MAX_BYTES) before FileReader converts files to Data URLs.
**Prevention:** Always validate both file type extension/MIME and byte size before invoking client-side file reading or uploading to server storage.
