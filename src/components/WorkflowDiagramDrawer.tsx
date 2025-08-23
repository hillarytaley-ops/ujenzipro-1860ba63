import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Circle, Rect, Triangle, FabricText, Line, IText } from "fabric";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Square, 
  Circle as CircleIcon, 
  Triangle as TriangleIcon,
  Type,
  Minus,
  MousePointer,
  Palette,
  Trash2,
  Save,
  ArrowRight,
  Pencil
} from "lucide-react";
import { toast } from "sonner";

type Tool = "select" | "draw" | "rectangle" | "circle" | "triangle" | "text" | "line" | "arrow";

const WorkflowDiagramDrawer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState("#2563eb");
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [strokeWidth, setStrokeWidth] = useState(2);

  const colors = [
    "#2563eb", // primary blue
    "#dc2626", // red
    "#16a34a", // green
    "#ca8a04", // yellow
    "#9333ea", // purple
    "#ea580c", // orange
    "#0891b2", // cyan
    "#000000", // black
    "#6b7280", // gray
  ];

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 1000,
      height: 700,
      backgroundColor: "#ffffff",
    });

    // Initialize the freeDrawingBrush
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = strokeWidth;

    setFabricCanvas(canvas);
    toast.success("Workflow diagram canvas ready!");

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === "draw";
    
    if (activeTool === "draw" && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor;
      fabricCanvas.freeDrawingBrush.width = strokeWidth;
    }
  }, [activeTool, activeColor, strokeWidth, fabricCanvas]);

  const handleToolClick = (tool: Tool) => {
    setActiveTool(tool);

    if (!fabricCanvas) return;

    if (tool === "rectangle") {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: "transparent",
        stroke: activeColor,
        strokeWidth: strokeWidth,
        width: 120,
        height: 80,
      });
      fabricCanvas.add(rect);
      fabricCanvas.setActiveObject(rect);
      toast.success("Rectangle added");
    } 
    else if (tool === "circle") {
      const circle = new Circle({
        left: 100,
        top: 100,
        fill: "transparent",
        stroke: activeColor,
        strokeWidth: strokeWidth,
        radius: 50,
      });
      fabricCanvas.add(circle);
      fabricCanvas.setActiveObject(circle);
      toast.success("Circle added");
    } 
    else if (tool === "triangle") {
      const triangle = new Triangle({
        left: 100,
        top: 100,
        fill: "transparent",
        stroke: activeColor,
        strokeWidth: strokeWidth,
        width: 100,
        height: 100,
      });
      fabricCanvas.add(triangle);
      fabricCanvas.setActiveObject(triangle);
      toast.success("Triangle added");
    }
    else if (tool === "text") {
      const text = new IText("Click to edit", {
        left: 100,
        top: 100,
        fill: activeColor,
        fontSize: 18,
        fontFamily: "Arial",
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
      toast.success("Text added - double click to edit");
    }
    else if (tool === "line") {
      const line = new Line([50, 100, 200, 100], {
        stroke: activeColor,
        strokeWidth: strokeWidth,
      });
      fabricCanvas.add(line);
      fabricCanvas.setActiveObject(line);
      toast.success("Line added");
    }
    else if (tool === "arrow") {
      // Create arrow using a line with triangle
      const line = new Line([50, 100, 200, 100], {
        stroke: activeColor,
        strokeWidth: strokeWidth,
      });
      
      const arrowHead = new Triangle({
        left: 195,
        top: 85,
        fill: activeColor,
        width: 20,
        height: 30,
        angle: 90,
      });
      
      fabricCanvas.add(line);
      fabricCanvas.add(arrowHead);
      toast.success("Arrow added");
    }
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    fabricCanvas.renderAll();
    toast.success("Canvas cleared!");
  };

  const handleSave = () => {
    if (!fabricCanvas) return;
    
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });
    
    const link = document.createElement('a');
    link.download = 'ujenzipro-workflow-diagram.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Workflow diagram saved!");
  };

  const addWorkflowElement = (type: "process" | "decision" | "start" | "end") => {
    if (!fabricCanvas) return;

    let element;
    const baseConfig = {
      left: 100,
      top: 100,
      fill: "#f8fafc",
      stroke: activeColor,
      strokeWidth: 2,
    };

    switch (type) {
      case "process":
        element = new Rect({
          ...baseConfig,
          width: 140,
          height: 60,
        });
        break;
      case "decision":
        element = new Rect({
          ...baseConfig,
          width: 100,
          height: 100,
          angle: 45,
        });
        break;
      case "start":
      case "end":
        element = new Circle({
          ...baseConfig,
          radius: 40,
          fill: type === "start" ? "#dcfce7" : "#fee2e2",
        });
        break;
    }

    if (element) {
      fabricCanvas.add(element);
      
      // Add label
      const label = new IText(type.charAt(0).toUpperCase() + type.slice(1), {
        left: element.left + (element.width || 80) / 2,
        top: element.top + (element.height || 80) / 2,
        fill: "#1f2937",
        fontSize: 14,
        textAlign: "center",
        originX: "center",
        originY: "center",
      });
      
      fabricCanvas.add(label);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} element added`);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            UjenziPro Workflow Diagram Creator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tools */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3">Drawing Tools</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={activeTool === "select" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTool("select")}
                >
                  <MousePointer className="h-4 w-4 mr-1" />
                  Select
                </Button>
                <Button
                  variant={activeTool === "draw" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTool("draw")}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Draw
                </Button>
                <Button
                  variant={activeTool === "rectangle" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToolClick("rectangle")}
                >
                  <Square className="h-4 w-4 mr-1" />
                  Rectangle
                </Button>
                <Button
                  variant={activeTool === "circle" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToolClick("circle")}
                >
                  <CircleIcon className="h-4 w-4 mr-1" />
                  Circle
                </Button>
                <Button
                  variant={activeTool === "triangle" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToolClick("triangle")}
                >
                  <TriangleIcon className="h-4 w-4 mr-1" />
                  Triangle
                </Button>
                <Button
                  variant={activeTool === "text" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToolClick("text")}
                >
                  <Type className="h-4 w-4 mr-1" />
                  Text
                </Button>
                <Button
                  variant={activeTool === "line" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToolClick("line")}
                >
                  <Minus className="h-4 w-4 mr-1" />
                  Line
                </Button>
                <Button
                  variant={activeTool === "arrow" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToolClick("arrow")}
                >
                  <ArrowRight className="h-4 w-4 mr-1" />
                  Arrow
                </Button>
              </div>
            </div>

            {/* Workflow Elements */}
            <div>
              <h4 className="font-semibold mb-3">Workflow Elements</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addWorkflowElement("start")}
                  className="bg-green-50 hover:bg-green-100"
                >
                  Start/End
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addWorkflowElement("process")}
                  className="bg-blue-50 hover:bg-blue-100"
                >
                  Process
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addWorkflowElement("decision")}
                  className="bg-yellow-50 hover:bg-yellow-100"
                >
                  Decision
                </Button>
              </div>
            </div>

            {/* Colors */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Colors
              </h4>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <Button
                    key={color}
                    className={`w-8 h-8 p-0 rounded-full border-2 ${
                      activeColor === color ? "border-foreground" : "border-border"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setActiveColor(color)}
                  />
                ))}
              </div>
            </div>

            {/* Stroke Width */}
            <div>
              <h4 className="font-semibold mb-3">Stroke Width</h4>
              <div className="flex gap-2">
                {[1, 2, 4, 6, 8].map((width) => (
                  <Button
                    key={width}
                    variant={strokeWidth === width ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStrokeWidth(width)}
                  >
                    {width}px
                  </Button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Save as PNG
              </Button>
              <Button onClick={handleClear} variant="outline" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Clear Canvas
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="border-2 border-border rounded-lg overflow-hidden bg-white">
            <canvas ref={canvasRef} className="max-w-full" />
          </div>

          {/* Instructions */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2">Quick Instructions</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use <Badge variant="secondary">Select</Badge> tool to move and resize elements</li>
                <li>• Double-click text elements to edit content</li>
                <li>• Use workflow elements for professional diagrams</li>
                <li>• Draw arrows to connect elements</li>
                <li>• Save your diagram as PNG when complete</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowDiagramDrawer;