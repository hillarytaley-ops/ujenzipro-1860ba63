import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import WorkflowDiagramDrawer from "@/components/WorkflowDiagramDrawer";

const WorkflowDrawing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">UjenziPro Workflow Diagram Creator</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Create professional workflow diagrams for the UjenziPro platform using our interactive drawing tool
            </p>
          </div>
          
          <WorkflowDiagramDrawer />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default WorkflowDrawing;