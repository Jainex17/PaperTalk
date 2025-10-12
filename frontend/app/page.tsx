import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex flex-col items-center justify-center px-6 pt-20 pb-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-6xl font-semibold tracking-tight mb-6">
            Chat with your documents
          </h1>

          <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
            Upload PDFs, ask questions, and get instant answers powered by AI.<br />
            Your intelligent document assistant.
          </p>

          <div className="mb-16">
            <Link
              href="/spaces"
              className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Start For Free
            </Link>
          </div>
        </div>

        {/* Dashboard Preview Section */}
        <div className="w-full max-w-6xl mx-auto">
          <div className="relative rounded-xl overflow-hidden border border-border bg-gradient-to-b from-card/50 to-muted/50 shadow-2xl">
            {/* Dashboard Header */}
            <div className="bg-card/80 border-b border-border px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-foreground">PaperTalk</span>
                <span className="text-xs text-muted-foreground">Document Chat</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-chart-1 to-chart-2 border-2 border-card" />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-chart-2 to-chart-3 border-2 border-card" />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-chart-3 to-chart-4 border-2 border-card" />
                </div>
                <button className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors">
                  Add Project
                </button>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="flex">
              {/* Sidebar */}
              <div className="w-48 bg-sidebar border-r border-sidebar-border p-4">
                <div className="space-y-1 text-sm">
                  <div className="px-3 py-2 text-foreground bg-secondary rounded-lg">Projects</div>
                  <div className="px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors">Billing</div>
                  <div className="px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors">Tasks</div>
                  <div className="px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors">Chats</div>
                  <div className="px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors">Transfer</div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">Projects</h2>
                    <p className="text-sm text-muted-foreground">List of all current projects</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-xs text-foreground bg-secondary rounded-md hover:bg-secondary/80 transition-colors">
                      Filter
                    </button>
                  </div>
                </div>

                {/* Project Table */}
                <div className="space-y-3">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs text-muted-foreground font-medium">
                    <div className="col-span-4">Project Name</div>
                    <div className="col-span-3">Started</div>
                    <div className="col-span-2">Client</div>
                    <div className="col-span-3">Progress</div>
                  </div>

                  {/* Project Rows */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-secondary/30 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                      <div className="col-span-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center">
                          <span className="text-xs text-primary-foreground font-semibold">P</span>
                        </div>
                        <div>
                          <div className="text-sm text-foreground font-medium">Pulse</div>
                          <div className="text-xs text-muted-foreground">Design System</div>
                        </div>
                      </div>
                      <div className="col-span-3 flex items-center">
                        <span className="text-sm text-foreground">15 January 2024</span>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-chart-2 to-chart-3" />
                          <span className="text-sm text-foreground">Frank Jones</span>
                        </div>
                      </div>
                      <div className="col-span-3 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: '80%' }} />
                        </div>
                        <span className="text-sm text-muted-foreground">80%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-secondary/30 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                      <div className="col-span-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-chart-3 to-chart-4 flex items-center justify-center">
                          <span className="text-xs text-primary-foreground font-semibold">S</span>
                        </div>
                        <div>
                          <div className="text-sm text-foreground font-medium">Synergy</div>
                          <div className="text-xs text-muted-foreground">Landing page</div>
                        </div>
                      </div>
                      <div className="col-span-3 flex items-center">
                        <span className="text-sm text-foreground">10 November 2023</span>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-chart-4 to-chart-5" />
                          <span className="text-sm text-foreground">Natalie Nowak</span>
                        </div>
                      </div>
                      <div className="col-span-3 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: '40%' }} />
                        </div>
                        <span className="text-sm text-muted-foreground">40%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
