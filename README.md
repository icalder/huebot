# Huebot

## Deployment

```
podman machine start
podman build -t icalder/huebot .
podman push icalder/huebot
podman machine stop
kubectl -n huebot rollout restart deploy/huebot
```