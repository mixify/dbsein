import { toPng } from "html-to-image";

export async function exportTopsterAsImage(
  element: HTMLElement
): Promise<string> {
  return toPng(element, {
    quality: 0.95,
    pixelRatio: 2,
    backgroundColor: "#0f172a",
  });
}

export function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
