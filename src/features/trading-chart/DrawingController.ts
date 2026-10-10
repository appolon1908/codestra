export type Drawing = { id: string; kind: "trend" | "horizontal" | "vertical" | "rectangle" | "text"; points: Array<{ time: number; price: number }>; locked?: boolean; visible?: boolean };
export class DrawingController {
  private drawings = new Map<string, Drawing>();
  add(drawing: Drawing) { this.drawings.set(drawing.id, drawing); return drawing; }
  remove(id: string) { this.drawings.delete(id); }
  list() { return [...this.drawings.values()]; }
}
