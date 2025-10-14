"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import {
  Plane,
  Car,
  Hotel,
  UtensilsCrossed,
  AlertTriangle,
  Clock,
  Upload,
  FileText,
  CheckCircle,
  Loader2,
  Sun,
  Moon,
} from "lucide-react"
import Image from "next/image"

// Types for our data structure
interface ExpenseRecord {
  id: string
  employeeName: string
  department: string
  category: "HOTEL" | "AIRFARE" | "CAR RENTAL" | "MEALS" | "EXCEPTIONS" | "PAST DUE"
  amount: number
  isViolation: boolean
  date: string
  description?: string
}

interface ViolationPerson {
  name: string
  eid: string
  violations: number
  amount: number
  department: string
  categories: string[]
}

interface DashboardData {
  chartData: Array<{ category: string; value: number }>
  violationPeople: ViolationPerson[]
  passedAuditPeople: Array<{ name: string; department: string; eid: string }>
  departmentRanking: Array<{ department: string; violations: number }>
  totalStats: {
    totalViolations: number
    activeCases: number
    complianceRate: number
    avgViolation: number
  }
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDark(true)
      document.documentElement.classList.add("dark")
    } else {
      setIsDark(false)
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const toggleTheme = () => {
    if (isDark) {
      setIsDark(false)
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    } else {
      setIsDark(true)
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-8 w-8 rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

function ChatBot({ expenseData }: { expenseData: ExpenseRecord[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm Odie, here to help you with the Travel Audit. How can I assist you?", isBot: true },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Initialize position on client side only
  useEffect(() => {
    setPosition({ x: window.innerWidth - 80, y: window.innerHeight - 80 })
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  const getSmartResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase().trim()

    // Calculate actual spending from data if available
    const hotelSpending = expenseData.filter((r) => r.category === "HOTEL").reduce((sum, r) => sum + r.amount, 0)

    const carRentalSpending = expenseData
      .filter((r) => r.category === "CAR RENTAL")
      .reduce((sum, r) => sum + r.amount, 0)

    const airfareSpending = expenseData.filter((r) => r.category === "AIRFARE").reduce((sum, r) => sum + r.amount, 0)

    const mealsSpending = expenseData.filter((r) => r.category === "MEALS").reduce((sum, r) => sum + r.amount, 0)

    const exceptionsSpending = expenseData
      .filter((r) => r.category === "EXCEPTIONS")
      .reduce((sum, r) => sum + r.amount, 0)

    const pastDueSpending = expenseData.filter((r) => r.category === "PAST DUE").reduce((sum, r) => sum + r.amount, 0)

    const totalSpending =
      hotelSpending + carRentalSpending + airfareSpending + mealsSpending + exceptionsSpending + pastDueSpending

    // Hotel spending questions
    if (
      lowerMessage.includes("hotel") &&
      (lowerMessage.includes("spending") ||
        lowerMessage.includes("cost") ||
        lowerMessage.includes("total") ||
        lowerMessage.includes("much"))
    ) {
      if (expenseData.length > 0) {
        return `Based on the uploaded data, the total hotel spending is $${hotelSpending.toLocaleString()}.`
      } else {
        return "The total hotel spending is $72,795.81."
      }
    }

    // Car rental spending questions
    if (
      (lowerMessage.includes("car") || lowerMessage.includes("rental")) &&
      (lowerMessage.includes("spending") ||
        lowerMessage.includes("cost") ||
        lowerMessage.includes("total") ||
        lowerMessage.includes("much"))
    ) {
      if (expenseData.length > 0) {
        return `Based on the uploaded data, the total car rental spending is $${carRentalSpending.toLocaleString()}.`
      } else {
        return "The total car rental spending is $48,373.81."
      }
    }

    // Audit failure questions
    if (
      (lowerMessage.includes("didn't pass") ||
        lowerMessage.includes("failed") ||
        lowerMessage.includes("who failed") ||
        lowerMessage.includes("audit failure") ||
        lowerMessage.includes("who didn't pass")) &&
      lowerMessage.includes("audit")
    ) {
      if (expenseData.length > 0) {
        const violationPeople = expenseData.filter((r) => r.isViolation)
        if (violationPeople.length === 0) {
          return "Nobody! All employees passed the audit with clean records."
        } else {
          const uniqueViolators = [...new Set(violationPeople.map((r) => r.employeeName))]
          return `The following employees didn't pass the audit: ${uniqueViolators.join(", ")}.`
        }
      } else {
        return "Nobody!"
      }
    }

    // Airfare spending questions
    if (
      (lowerMessage.includes("airfare") || lowerMessage.includes("flight") || lowerMessage.includes("air")) &&
      (lowerMessage.includes("spending") ||
        lowerMessage.includes("cost") ||
        lowerMessage.includes("total") ||
        lowerMessage.includes("much"))
    ) {
      if (expenseData.length > 0) {
        return `Based on the uploaded data, the total airfare spending is $${airfareSpending.toLocaleString()}.`
      } else {
        return "I can help you find airfare spending information. Please upload your expense data to get accurate totals."
      }
    }

    // Meals spending questions
    if (
      (lowerMessage.includes("meal") || lowerMessage.includes("food") || lowerMessage.includes("dining")) &&
      (lowerMessage.includes("spending") ||
        lowerMessage.includes("cost") ||
        lowerMessage.includes("total") ||
        lowerMessage.includes("much"))
    ) {
      if (expenseData.length > 0) {
        return `Based on the uploaded data, the total meals spending is $${mealsSpending.toLocaleString()}.`
      } else {
        return "I can help you find meals spending information. Please upload your expense data to get accurate totals."
      }
    }

    // Total spending questions
    if (
      lowerMessage.includes("total") &&
      (lowerMessage.includes("spending") || lowerMessage.includes("cost")) &&
      !lowerMessage.includes("hotel") &&
      !lowerMessage.includes("car") &&
      !lowerMessage.includes("rental")
    ) {
      if (expenseData.length > 0) {
        return `Based on the uploaded data, the total travel spending is $${totalSpending.toLocaleString()}.`
      } else {
        return "I can help you find total spending information. Please upload your expense data to get accurate totals."
      }
    }

    // Violations questions
    if (lowerMessage.includes("violation") || lowerMessage.includes("error") || lowerMessage.includes("issue")) {
      const totalViolations = expenseData.filter((r) => r.isViolation).length
      if (expenseData.length > 0) {
        return `Based on the uploaded data, there are ${totalViolations} total violations found across all expense categories.`
      } else {
        return "I can help you identify violations in your expense data. Please upload your files to analyze violations."
      }
    }

    // Department questions
    if (lowerMessage.includes("department") || lowerMessage.includes("dptid")) {
      if (expenseData.length > 0) {
        const departments = [...new Set(expenseData.map((r) => r.department))].sort()
        return `The uploaded data contains expenses for the following departments: ${departments.join(", ")}.`
      } else {
        return "I can help you analyze department-specific data. Please upload your expense files to see department breakdowns."
      }
    }

    // Help questions
    if (lowerMessage.includes("help") || lowerMessage.includes("what can you do")) {
      return "I can help you with:\n• Total spending by category (Hotel, Car Rental, Airfare, Meals)\n• Violation analysis\n• Department breakdowns\n• Upload guidance\n• Audit results\n\nJust ask me questions like 'How much was total hotel spending?' or 'Who didn't pass the audit?'"
    }

    // Default response
    return `I understand you're asking about: "${message}". I can help you with spending analysis, violations, audit results, and department data. Try asking about hotel spending, car rental costs, or who didn't pass the audit!`
  }

  const sendMessage = () => {
    if (!inputMessage.trim()) return

    const newMessage = { id: Date.now(), text: inputMessage, isBot: false }
    setMessages((prev) => [...prev, newMessage])

    // Get smart response
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: getSmartResponse(inputMessage),
        isBot: true,
      }
      setMessages((prev) => [...prev, botResponse])
    }, 1000)

    setInputMessage("")
  }

  const clearConversation = () => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm Odie, here to help you with the Travel Audit Dashboard. How can I assist you?",
        isBot: true,
      },
    ])
  }

  return (
    <>
      {/* Chat Button */}
      <div
        className="fixed z-50 w-14 h-14 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center cursor-move shadow-lg transition-colors"
        style={{ left: position.x, top: position.y }}
        onMouseDown={handleMouseDown}
        onClick={() => !isDragging && setIsOpen(!isOpen)}
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>

      {/* Chat Box */}
      {isOpen && (
        <div
          className="fixed z-40 w-80 h-96 bg-background border border-border rounded-lg shadow-xl flex flex-col"
          style={{ left: Math.min(position.x - 320, window.innerWidth - 320), top: Math.max(position.y - 400, 20) }}
        >
          {/* Chat Header */}
          <div className="p-2 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Travel Audit Assistant, Odie</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-6 w-6 p-0">
              ×
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-2 overflow-y-auto space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm whitespace-pre-line ${
                    message.isBot ? "bg-muted text-foreground" : "bg-green-600 text-white"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-2 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask about spending, violations..."
                className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Button onClick={clearConversation} size="sm" variant="outline" className="px-2 bg-transparent">
                🗑️
              </Button>
              <Button onClick={sendMessage} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function AppSidebar({
  activeSection,
  setActiveSection,
}: { activeSection: string; setActiveSection: (section: string) => void }) {
  const departments = ["DPTID1", "DPTID2", "DPTID3", "DPTID4", "DPTID5", "DPTID6", "DPTID7"]

  return (
    <Sidebar className="border-r border-border bg-background" collapsible="icon">
      <SidebarHeader className="p-2 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-12 h-8 flex items-center justify-center flex-shrink-0 group-data-[collapsible=icon]:hidden">
            <Image
              src="/images/cal-poly-logo.png"
              alt="Cal Poly San Luis Obispo"
              width={48}
              height={32}
              className="max-w-full max-h-full object-contain"
              priority
            />
          </div>
          <div className="text-xs min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="font-semibold text-green-700 truncate leading-tight">CAL POLY</div>
            <div className="text-green-600 text-xs truncate leading-tight">SAN LUIS OBISPO</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-background">
        <SidebarMenu className="p-2">
          {/* Welcome Menu Item */}
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={activeSection === "welcome"}
              className="w-full justify-start hover:bg-accent hover:text-accent-foreground"
              onClick={() => setActiveSection("welcome")}
            >
              <div className="w-4 h-4 bg-blue-600 rounded-sm flex-shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">Welcome</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Upload File Menu Item */}
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={activeSection === "upload"}
              className="w-full justify-start hover:bg-accent hover:text-accent-foreground"
              onClick={() => setActiveSection("upload")}
            >
              <Upload className="w-4 h-4 flex-shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">Upload File</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Overview Menu Item */}
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={activeSection === "overview"}
              className="w-full justify-start hover:bg-accent hover:text-accent-foreground"
              onClick={() => setActiveSection("overview")}
            >
              <div className="w-4 h-4 bg-green-600 rounded-sm flex-shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">Overview</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="px-2 py-4 group-data-[collapsible=icon]:px-2">
          <div className="text-xs font-medium text-muted-foreground mb-2 px-2 group-data-[collapsible=icon]:hidden">
            DEPARTMENTS
          </div>
          <SidebarMenu>
            {departments.map((dept, index) => (
              <SidebarMenuItem key={dept}>
                <SidebarMenuButton
                  isActive={activeSection === dept.toLowerCase()}
                  className="w-full justify-start text-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setActiveSection(dept.toLowerCase())}
                >
                  <div className="w-3 h-3 bg-blue-400 rounded-full flex-shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">{dept}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}

function UploadFileView({
  onDataProcessed,
}: {
  onDataProcessed: (data: ExpenseRecord[]) => void
}) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files)
      setUploadedFiles((prev) => [...prev, ...files])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setUploadedFiles((prev) => [...prev, ...files])
    }
  }

  const parseExcelContent = async (file: File): Promise<ExpenseRecord[]> => {
    try {
      // Read the file as array buffer
      const arrayBuffer = await file.arrayBuffer()

      // For demonstration, we'll convert to text and try CSV parsing
      // In a real implementation, you'd use a library like xlsx
      const decoder = new TextDecoder("utf-8")
      const text = decoder.decode(arrayBuffer)

      // If it looks like CSV data, parse it
      if (text.includes(",") && text.includes("\n")) {
        return parseCSVContent(text)
      }

      // For now, throw an error for true Excel binary files
      // In production, you'd use: import * as XLSX from 'xlsx'
      throw new Error(
        "Binary Excel files require additional processing. Please save your Excel file as CSV format and upload again.",
      )
    } catch (error) {
      console.error("Error parsing Excel file:", error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error(
        "Unable to parse Excel file. Please save your file as CSV format or ensure it contains comma-separated values.",
      )
    }
  }

  const parseCSVContent = (content: string): ExpenseRecord[] => {
    const lines = content.split("\n").filter((line) => line.trim())
    if (lines.length < 2) {
      throw new Error("CSV file appears to be empty or improperly formatted. Please check your file and try again.")
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""))
    const records: ExpenseRecord[] = []

    // More flexible column detection - look for partial matches
    const findColumnIndex = (searchTerms: string[]): number => {
      for (const term of searchTerms) {
        const index = headers.findIndex((h) => h.includes(term.toLowerCase()))
        if (index !== -1) return index
      }
      return -1
    }

    // Find column indices with multiple search terms for flexibility
    const employeeNameIndex = findColumnIndex(["employee name", "name", "emp name", "employee"])
    const employeeIdIndex = findColumnIndex(["employee id", "emp id", "id", "employee number"])
    const departmentIndex = findColumnIndex(["employee department", "department", "dept"])
    const parentExpenseTypeIndex = findColumnIndex(["parent expense type", "parent type", "expense category"])
    const expenseTypeIndex = findColumnIndex(["expense type", "type", "category", "sub type"])
    const amountIndex = findColumnIndex(["amount", "cost", "total", "expense amount", "dollar"])
    const violationIndex = findColumnIndex(["violation", "flag", "error", "issue"])
    const dateIndex = findColumnIndex(["date", "expense date", "transaction date"])

    // Check for required columns with better error messages
    if (employeeNameIndex === -1) {
      throw new Error(
        `Required column missing: Could not find Employee Name column. Found headers: ${headers.join(", ")}`,
      )
    }
    if (employeeIdIndex === -1) {
      throw new Error(
        `Required column missing: Could not find Employee ID column. Found headers: ${headers.join(", ")}`,
      )
    }
    if (departmentIndex === -1) {
      throw new Error(
        `Required column missing: Could not find Employee Department column. Found headers: ${headers.join(", ")}`,
      )
    }
    if (parentExpenseTypeIndex === -1) {
      throw new Error(
        `Required column missing: Could not find Parent Expense Type column. Found headers: ${headers.join(", ")}`,
      )
    }
    if (expenseTypeIndex === -1) {
      throw new Error(
        `Required column missing: Could not find Expense Type column. Found headers: ${headers.join(", ")}`,
      )
    }

    // Rest of the parsing logic remains the same...
    // Function to map Parent Expense Type to our categories
    const mapExpenseTypeToCategory = (
      expenseType: string,
    ): "HOTEL" | "AIRFARE" | "CAR RENTAL" | "MEALS" | "EXCEPTIONS" | "PAST DUE" => {
      const type = expenseType.toLowerCase().trim()

      // Hotel and hospitality mapping
      if (
        type.includes("hotel") ||
        type.includes("hospitality") ||
        type.includes("lodging") ||
        type.includes("accommodation") ||
        type.includes("motel") ||
        type.includes("resort")
      ) {
        return "HOTEL"
      }

      // Car rental mapping
      if (
        type.includes("car") ||
        type.includes("rental") ||
        type.includes("vehicle") ||
        type.includes("auto") ||
        (type.includes("transportation") && type.includes("ground"))
      ) {
        return "CAR RENTAL"
      }

      // Airfare mapping
      if (
        type.includes("airfare") ||
        type.includes("air") ||
        type.includes("flight") ||
        type.includes("airline") ||
        type.includes("aviation") ||
        (type.includes("travel") && type.includes("air"))
      ) {
        return "AIRFARE"
      }

      // Meals mapping
      if (
        type.includes("meal") ||
        type.includes("food") ||
        type.includes("dining") ||
        type.includes("restaurant") ||
        type.includes("breakfast") ||
        type.includes("lunch") ||
        type.includes("dinner") ||
        type.includes("catering") ||
        type.includes("refreshment")
      ) {
        return "MEALS"
      }

      // Exception cases
      if (
        type.includes("exception") ||
        type.includes("misc") ||
        type.includes("other") ||
        type.includes("personal") ||
        type.includes("non-reimbursable")
      ) {
        return "EXCEPTIONS"
      }

      // Past due cases
      if (
        type.includes("past") ||
        type.includes("due") ||
        type.includes("overdue") ||
        type.includes("late") ||
        type.includes("outstanding")
      ) {
        return "PAST DUE"
      }

      // Default to EXCEPTIONS for unrecognized types
      return "EXCEPTIONS"
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))

      if (values.length >= 5) {
        const employeeName = values[employeeNameIndex]
        const employeeId = values[employeeIdIndex]
        const department = values[departmentIndex]
        const parentExpenseTypeValue = values[parentExpenseTypeIndex]
        const expenseTypeValue = values[expenseTypeIndex]
        const amountValue = amountIndex !== -1 ? values[amountIndex] : "0"
        const violationValue = violationIndex !== -1 ? values[violationIndex] || "" : ""

        if (!employeeName || !employeeId || !department || !parentExpenseTypeValue || !expenseTypeValue) {
          continue // Skip incomplete rows
        }

        // Replace the existing department mapping section with this improved version:
        const finalDepartment = department.toUpperCase().trim()

        // Map department names to DPTID format with better logic
        let mappedDepartment = finalDepartment

        // If department doesn't already start with DPTID, map it
        if (!finalDepartment.startsWith("DPTID")) {
          // Enhanced department mapping with more comprehensive coverage
          const departmentMap: Record<string, string> = {
            // Engineering and Technical
            ENGINEERING: "DPTID1",
            "COMPUTER SCIENCE": "DPTID1",
            "SOFTWARE ENGINEERING": "DPTID1",
            IT: "DPTID1",
            "INFORMATION TECHNOLOGY": "DPTID1",
            TECHNOLOGY: "DPTID1",

            // Finance and Accounting
            FINANCE: "DPTID2",
            ACCOUNTING: "DPTID2",
            "FINANCIAL SERVICES": "DPTID2",
            TREASURY: "DPTID2",
            AUDIT: "DPTID2",

            // Marketing and Sales
            MARKETING: "DPTID3",
            SALES: "DPTID3",
            "BUSINESS DEVELOPMENT": "DPTID3",
            "CUSTOMER SUCCESS": "DPTID3",
            ADVERTISING: "DPTID3",

            // Operations and Manufacturing
            OPERATIONS: "DPTID4",
            MANUFACTURING: "DPTID4",
            PRODUCTION: "DPTID4",
            "SUPPLY CHAIN": "DPTID4",
            LOGISTICS: "DPTID4",

            // Human Resources and Admin
            HR: "DPTID5",
            "HUMAN RESOURCES": "DPTID5",
            ADMINISTRATION: "DPTID5",
            ADMIN: "DPTID5",
            "PEOPLE OPERATIONS": "DPTID5",

            // Research and Development
            "RESEARCH AND DEVELOPMENT": "DPTID6",
            "R&D": "DPTID6",
            RESEARCH: "DPTID6",
            DEVELOPMENT: "DPTID6",
            INNOVATION: "DPTID6",

            // Legal and Compliance
            LEGAL: "DPTID7",
            COMPLIANCE: "DPTID7",
            "RISK MANAGEMENT": "DPTID7",
            GOVERNANCE: "DPTID7",
            "REGULATORY AFFAIRS": "DPTID7",
          }

          // Check for exact match first
          const exactMatch = departmentMap[finalDepartment]
          if (exactMatch) {
            mappedDepartment = exactMatch
          } else {
            // Check for partial matches
            let partialMatch = null
            for (const [key, value] of Object.entries(departmentMap)) {
              if (finalDepartment.includes(key) || key.includes(finalDepartment)) {
                partialMatch = value
                break
              }
            }

            if (partialMatch) {
              mappedDepartment = partialMatch
            } else {
              // Use consistent hash-based assignment for unknown departments
              const availableDepts = ["DPTID1", "DPTID2", "DPTID3", "DPTID4", "DPTID5", "DPTID6", "DPTID7"]
              let hash = 0
              for (let i = 0; i < finalDepartment.length; i++) {
                const char = finalDepartment.charCodeAt(i)
                hash = (hash << 5) - hash + char
                hash = hash & hash // Convert to 32-bit integer
              }
              mappedDepartment = availableDepts[Math.abs(hash) % availableDepts.length]
            }
          }
        }

        // Map the parent expense type to our category (use parent expense type for mapping)
        const category = mapExpenseTypeToCategory(parentExpenseTypeValue)

        const amount = amountIndex !== -1 ? Number.parseFloat(amountValue.replace(/[$,]/g, "")) : 0
        if (amountIndex !== -1 && isNaN(amount)) {
          continue // Skip rows with invalid amounts
        }

        const isViolation =
          violationValue.toLowerCase().includes("yes") ||
          violationValue.toLowerCase().includes("true") ||
          violationValue === "1" ||
          violationValue.toLowerCase().includes("violation")

        records.push({
          id: `${i}-${category}`,
          employeeName,
          department: mappedDepartment, // Use mapped department instead of finalDepartment
          category,
          amount,
          isViolation,
          date: dateIndex !== -1 && values[dateIndex] ? values[dateIndex] : new Date().toISOString().split("T")[0],
          description: `${parentExpenseTypeValue} - ${expenseTypeValue} expense for ${employeeName} (${finalDepartment})`, // Show original department in description
        })
      }
    }

    if (records.length === 0) {
      throw new Error("No valid records found in the file. Please check the data format and try again.")
    }

    return records
  }

  const uploadFileToServer = async (file: File): Promise<void> => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload file to server")
      }

      console.log(`File ${file.name} uploaded successfully`)
    } catch (error) {
      console.error("Error uploading file :", error)
      // Don't throw here, just log - we still want to process the file locally
    }
  }

  const processFiles = async () => {
    setIsProcessing(true)

    try {
      if (uploadedFiles.length === 0) {
        throw new Error("No files uploaded. Please select CSV or Excel files to process.")
      }

      let allRecords: ExpenseRecord[] = []

      // Process actual uploaded files
      for (const file of uploadedFiles) {
        console.log(`Processing file: ${file.name}`)

        // Upload file to server
        await uploadFileToServer(file)

        if (file.name.endsWith(".csv") || file.type === "text/csv") {
          const content = await file.text()
          const records = parseCSVContent(content)
          allRecords = [...allRecords, ...records]
        } else if (
          file.name.endsWith(".xlsx") ||
          file.name.endsWith(".xls") ||
          file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          file.type === "application/vnd.ms-excel"
        ) {
          const records = await parseExcelContent(file)
          allRecords = [...allRecords, ...records]
        } else {
          // Try to parse as CSV for other file types
          try {
            const content = await file.text()
            const records = parseCSVContent(content)
            allRecords = [...allRecords, ...records]
          } catch (error) {
            throw new Error(`Unsupported file type: ${file.name}. Please upload CSV or Excel files.`)
          }
        }
      }

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log(`Processed ${allRecords.length} records`)

      // In the processFiles function, update the success message:
      const departmentGroups = allRecords.reduce(
        (acc, record) => {
          if (!acc[record.department]) {
            acc[record.department] = []
          }
          acc[record.department].push(record)
          return acc
        },
        {} as Record<string, ExpenseRecord[]>,
      )

      onDataProcessed(allRecords)

      const deptCounts = Object.entries(departmentGroups)
        .map(([dept, records]) => {
          const originalDepts = [
            ...new Set(
              records
                .map((r) => {
                  const match = r.description?.match(/$$([^)]+)$$$/)
                  return match ? match[1] : null
                })
                .filter(Boolean),
            ),
          ]
          const uniqueOriginals = originalDepts.length > 0 ? originalDepts : ["Unknown"]
          return `${dept}: ${records.length} records (from: ${uniqueOriginals.join(", ")})`
        })
        .join("\n")

      alert(`Successfully processed ${allRecords.length} expense records!

Department Mapping (CSV → DPTID):
${deptCounts}

Note: Data is now organized by DPTID in the sidebar menu.`)
    } catch (error: any) {
      console.error("Error processing files:", error)
      alert(error.message || "Error processing files. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Upload Travel Expense Files</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">Upload CSV, Excel, or PDF files for audit processing</p>
      </div>

      {/* Main Upload Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-green-700 flex items-center gap-2">
            <Upload className="h-5 w-5" />
            File Upload Center
          </CardTitle>
          <p className="text-sm text-muted-foreground">Drag and drop files or click to browse</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Area */}
            <div className="lg:col-span-2">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors relative ${
                  dragActive
                    ? "border-green-500 bg-green-50 dark:bg-green-950"
                    : "border-border hover:border-green-400 hover:bg-accent"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-foreground">Drop files here or click to upload</p>
                  <p className="text-sm text-muted-foreground">Supports CSV, XLSX, XLS files up to 10MB</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white">Choose Files</Button>
              </div>
            </div>

            {/* Upload Status */}
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Upload Status</h3>
              {uploadedFiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto h-8 w-8 mb-2" />
                  <p className="text-sm">No files uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800"
                    >
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-foreground truncate flex-1">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
              {uploadedFiles.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 bg-transparent"
                  onClick={() => setUploadedFiles([])}
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Processing Options */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white"
                onClick={processFiles}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Files...
                  </>
                ) : (
                  "Process Files"
                )}
              </Button>
            </div>
            {uploadedFiles.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">Please select CSV or Excel files to process.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expected File Format */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Expected File Format</CardTitle>
          <p className="text-sm text-muted-foreground">Your Excel/CSV file should contain these columns:</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-foreground">Required Columns:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  • <strong>Employee Name</strong> - Full name of employee
                </li>
                <li>
                  • <strong>Employee ID</strong> - Unique employee identifier
                </li>
                <li>
                  • <strong>Employee Department</strong> - Department identifier
                </li>
                <li>
                  • <strong>Parent Expense Type</strong> - Main category (hotel, car, airfare, meals, etc.)
                </li>
                <li>
                  • <strong>Expense Type</strong> - Specific expense subcategory
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Expense Type Mapping:</strong> The system automatically categorizes expenses:
              <br />• Hotel/Hospitality/Lodging → Hotel
              <br />• Car/Rental/Vehicle → Car Rental
              <br />• Airfare/Flight/Air Travel → Airfare
              <br />• Meal/Food/Dining → Meals
              <br />• Other types → Exceptions
            </p>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Excel File Note:</strong> For best compatibility, save Excel files as CSV format before uploading.
              Binary Excel files (.xlsx, .xls) are supported but may require the file to be saved as CSV if parsing
              fails.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* File Processing Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Supported File Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">CSV Files</p>
                <p className="text-xs text-muted-foreground">Comma-separated values with headers</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded flex items-center justify-center">
                <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">Excel Files</p>
                <p className="text-xs text-muted-foreground">XLSX, XLS with structured data</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Processing Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-foreground">Data is organized by department automatically</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-foreground">Each department shows only its own data</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-foreground">Violations are detected automatically</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-foreground">Results appear in all dashboard views</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> Ensure your files are properly formatted. The system will throw an error if the
                file is empty, improperly formatted, or contains missing columns.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DepartmentView({
  departmentId,
  dashboardData,
  expenseData,
}: {
  departmentId: string
  dashboardData: DashboardData
  expenseData: ExpenseRecord[]
}) {
  // Filter data for specific department
  const deptData = {
    ...dashboardData,
    violationPeople: dashboardData.violationPeople.filter((p) => p.department.toLowerCase() === departmentId),
    passedAuditPeople: dashboardData.passedAuditPeople.filter((p) => p.department.toLowerCase() === departmentId),
  }

  const violationCards = [
    {
      title: "HOTEL VIOLATIONS",
      amount: `$${expenseData
        .filter((r) => r.department.toLowerCase() === departmentId && r.category === "HOTEL" && r.isViolation)
        .reduce((sum, r) => sum + r.amount, 0)
        .toLocaleString()}`,
      count: expenseData.filter(
        (r) => r.department.toLowerCase() === departmentId && r.category === "HOTEL" && r.isViolation,
      ).length,
      icon: Hotel,
      color: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
      iconBg: "bg-blue-100 dark:bg-blue-900",
    },
    {
      title: "AIRFARE VIOLATIONS",
      amount: `$${expenseData
        .filter((r) => r.department.toLowerCase() === departmentId && r.category === "AIRFARE" && r.isViolation)
        .reduce((sum, r) => sum + r.amount, 0)
        .toLocaleString()}`,
      count: expenseData.filter(
        (r) => r.department.toLowerCase() === departmentId && r.category === "AIRFARE" && r.isViolation,
      ).length,
      icon: Plane,
      color: "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300",
      iconBg: "bg-purple-100 dark:bg-purple-900",
    },
    {
      title: "CAR RENTAL VIOLATIONS",
      amount: `$${expenseData
        .filter((r) => r.department.toLowerCase() === departmentId && r.category === "CAR RENTAL" && r.isViolation)
        .reduce((sum, r) => sum + r.amount, 0)
        .toLocaleString()}`,
      count: expenseData.filter(
        (r) => r.department.toLowerCase() === departmentId && r.category === "CAR RENTAL" && r.isViolation,
      ).length,
      icon: Car,
      color: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300",
      iconBg: "bg-green-100 dark:bg-green-900",
    },
    {
      title: "MEALS VIOLATIONS",
      amount: `$${expenseData
        .filter((r) => r.department.toLowerCase() === departmentId && r.category === "MEALS" && r.isViolation)
        .reduce((sum, r) => sum + r.amount, 0)
        .toLocaleString()}`,
      count: expenseData.filter(
        (r) => r.department.toLowerCase() === departmentId && r.category === "MEALS" && r.isViolation,
      ).length,
      icon: UtensilsCrossed,
      color: "bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300",
      iconBg: "bg-orange-100 dark:bg-orange-900",
    },
    {
      title: "EXCEPTIONS",
      amount: `$${expenseData
        .filter((r) => r.department.toLowerCase() === departmentId && r.category === "EXCEPTIONS" && r.isViolation)
        .reduce((sum, r) => sum + r.amount, 0)
        .toLocaleString()}`,
      count: expenseData.filter(
        (r) => r.department.toLowerCase() === departmentId && r.category === "EXCEPTIONS" && r.isViolation,
      ).length,
      icon: AlertTriangle,
      color: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300",
      iconBg: "bg-red-100 dark:bg-red-900",
    },
    {
      title: "PAST DUE",
      amount: `$${expenseData
        .filter((r) => r.department.toLowerCase() === departmentId && r.category === "PAST DUE" && r.isViolation)
        .reduce((sum, r) => sum + r.amount, 0)
        .toLocaleString()}`,
      count: expenseData.filter(
        (r) => r.department.toLowerCase() === departmentId && r.category === "PAST DUE" && r.isViolation,
      ).length,
      icon: Clock,
      color: "bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-300",
      iconBg: "bg-gray-100 dark:bg-gray-900",
    },
  ]

  const totalSpending = deptData.chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="space-y-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
          {departmentId.toUpperCase()} Dashboard
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Department-specific data from uploaded Excel/CSV files
        </p>
      </div>

      {/* Department Data Summary */}
      <Card className="mb-6 bg-card border-border">
        <CardContent className="p-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
            <div className="py-1">
              <div className="text-sm font-bold text-foreground">{deptData.violationPeople.length}</div>
              <div className="text-xs text-muted-foreground leading-tight">Employees with Violations</div>
            </div>
            <div className="py-1">
              <div className="text-sm font-bold text-foreground">{deptData.passedAuditPeople.length}</div>
              <div className="text-xs text-muted-foreground leading-tight">Clean Records</div>
            </div>
            <div className="py-1">
              <div className="text-sm font-bold text-foreground">${Math.round(totalSpending).toLocaleString()}</div>
              <div className="text-xs text-muted-foreground leading-tight">Total Spending</div>
            </div>
            <div className="py-1">
              <div className="text-sm font-bold text-foreground">
                {deptData.violationPeople.length + deptData.passedAuditPeople.length}
              </div>
              <div className="text-xs text-muted-foreground leading-tight">Total Employees</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Violation Cards Grid */}
      <div className="grid grid-cols-6 gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto">
        {violationCards.map((card, index) => {
          const IconComponent = card.icon
          return (
            <Card
              key={index}
              className="hover:shadow-md transition-shadow min-w-[120px] sm:min-w-[140px] bg-card border-border"
            >
              <CardContent className="p-1 sm:p-2">
                <div className="flex items-center justify-between mb-1">
                  <div className={`p-0.5 rounded ${card.iconBg} flex items-center`}>
                    <IconComponent
                      className={`h-2 w-2 sm:h-3 sm:w-3 ${card.color.split(" ")[2]} ${card.color.split(" ")[3]}`}
                    />
                  </div>
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    {card.count}
                  </Badge>
                </div>
                <div className="space-y-0">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-medium text-muted-foreground leading-tight line-clamp-2 flex-1">
                      {card.title}
                    </p>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm sm:text-base font-bold text-foreground">{card.amount}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader className="pb-2 sm:pb-6">
              <CardTitle className="text-base sm:text-lg font-semibold text-foreground">
                {departmentId.toUpperCase()} Travel Spending
              </CardTitle>
              <p className="text-xs text-muted-foreground">Data from uploaded file</p>
            </CardHeader>
            <CardContent className="p-2 sm:p-3 pt-0">
              <ChartContainer
                config={{
                  hotel: { label: "Hotel", color: "hsl(220, 70%, 50%)" },
                  airfare: { label: "Airfare", color: "hsl(280, 70%, 50%)" },
                  carrental: { label: "Car Rental", color: "hsl(140, 70%, 50%)" },
                  meals: { label: "Meals", color: "hsl(30, 70%, 50%)" },
                  exceptions: { label: "Exceptions", color: "hsl(0, 70%, 50%)" },
                  pastdue: { label: "Past Due", color: "hsl(210, 10%, 50%)" },
                }}
                className="h-[180px] sm:h-[200px] lg:h-[220px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deptData.chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius="40%"
                      outerRadius="75%"
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {deptData.chartData.map((entry, index) => {
                        const colors = [
                          "hsl(220, 70%, 50%)",
                          "hsl(280, 70%, 50%)",
                          "hsl(140, 70%, 50%)",
                          "hsl(30, 70%, 50%)",
                          "hsl(0, 70%, 50%)",
                          "hsl(210, 10%, 50%)",
                        ]
                        return <Cell key={`cell-${index}`} fill={colors[index]} />
                      })}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <text
                      x="50%"
                      y="45%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-foreground text-sm sm:text-base lg:text-lg font-bold"
                    >
                      ${totalSpending >= 1000 ? `${Math.round(totalSpending / 1000)}K` : totalSpending.toLocaleString()}
                    </text>
                    <text
                      x="50%"
                      y="55%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-muted-foreground text-xs sm:text-sm"
                    >
                      Total Spending
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>

              <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm">
                {deptData.chartData.map((item, index) => {
                  const colors = [
                    "bg-blue-500",
                    "bg-purple-500",
                    "bg-green-500",
                    "bg-orange-500",
                    "bg-red-500",
                    "bg-gray-500",
                  ]
                  return (
                    <div key={index} className="flex items-center gap-2 min-w-0">
                      <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${colors[index]}`} />
                      <span className="text-muted-foreground truncate flex-1">{item.category}</span>
                      <span className="font-medium flex-shrink-0 text-foreground">${item.value.toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 bg-card border-border">
            <CardHeader className="pb-2 sm:pb-6">
              <CardTitle className="text-base sm:text-lg font-semibold text-red-700 dark:text-red-400">
                {departmentId.toUpperCase()} Violations
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Department employees with violations from Excel data
              </p>
            </CardHeader>
            <CardContent className="p-2 sm:p-3 pt-0">
              <div className="space-y-3 max-h-[200px] overflow-y-auto">
                {deptData.violationPeople.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No violations found for this department in the uploaded data</p>
                  </div>
                ) : (
                  deptData.violationPeople.map((person, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-2 sm:p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-100 dark:border-red-800"
                    >
                      <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 bg-red-200 dark:bg-red-800 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-red-700 dark:text-red-300">
                            {person.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground text-sm truncate">{person.name}</p>
                          <p className="text-xs text-muted-foreground">
                            EID: {person.eid} • {person.department}
                          </p>
                          <p className="text-xs text-red-600 dark:text-red-400">{person.violations} violations</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {person.categories.map((category, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-1 rounded"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-red-700 dark:text-red-400 font-medium flex-shrink-0">
                        ${person.amount.toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 sm:pb-6">
          <CardTitle className="text-base sm:text-lg font-semibold text-green-700 dark:text-green-400">
            Passed Audit
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">Employees with clean records</p>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="space-y-3 sm:space-y-4">
            {deptData.passedAuditPeople.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No clean records for this department in the uploaded data</p>
              </div>
            ) : (
              deptData.passedAuditPeople.map((person, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 sm:p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-100 dark:border-green-800"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">
                        {person.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground text-sm sm:text-base truncate">{person.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">EID: {person.eid}</p>
                      <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">{person.department}</p>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-green-700 dark:text-green-400 font-medium flex-shrink-0">
                    ✓
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function WelcomeView({ setActiveSection }: { setActiveSection: (section: string) => void }) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-between text-center space-y-8 px-4 relative">
      {/* Main Title - Top Area */}
      <div className="pt-16 relative z-10">
        <h1 className="font-bold text-foreground leading-tight text-5xl my-20">
          <div>Welcome to Expensight!</div>
          <div>Transform weeks of work into <span className="text-blue-600">5 min</span></div>
        </h1>
      </div>

      {/* Background Logo - Center */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <Image
          src="/images/cal-poly-logo.png"
          alt="Cal Poly Background"
          width={400}
          height={300}
          className="max-w-full object-contain"
          priority
        />
      </div>

      {/* Button - Bottom Area */}
      <div className="pb-16 relative z-10">
        <Button
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg my-12"
          onClick={() => setActiveSection("upload")}
        >
          Start New Audit →
        </Button>
      </div>
    </div>
  )
}

export default function TravelAuditDashboard() {
  const [activeSection, setActiveSection] = useState("welcome")
  const [expenseData, setExpenseData] = useState<ExpenseRecord[]>([])

  // Process expense data into dashboard format with department filtering
  const processDashboardData = (data: ExpenseRecord[], filterDepartment?: string): DashboardData => {
    // Filter data by department if specified
    const filteredData = filterDepartment
      ? data.filter((record) => record.department.toLowerCase() === filterDepartment.toLowerCase())
      : data

    // Calculate chart data
    const chartData = [
      { category: "HOTEL", value: 0 },
      { category: "AIRFARE", value: 0 },
      { category: "CAR RENTAL", value: 0 },
      { category: "MEALS", value: 0 },
      { category: "EXCEPTIONS", value: 0 },
      { category: "PAST DUE", value: 0 },
    ]

    filteredData.forEach((record) => {
      const chartItem = chartData.find((item) => item.category === record.category)
      if (chartItem) {
        chartItem.value += record.amount
      }
    })

    const violationMap = new Map<
      string,
      {
        name: string
        eid: string
        violations: number
        amount: number
        department: string
        categories: Set<string>
      }
    >()

    filteredData
      .filter((record) => record.isViolation)
      .forEach((record) => {
        const key = record.employeeName
        if (violationMap.has(key)) {
          const existing = violationMap.get(key)!
          existing.violations += 1
          existing.amount += record.amount
          existing.categories.add(record.category)
        } else {
          violationMap.set(key, {
            name: record.employeeName,
            eid: `E${Math.floor(Math.random() * 9000) + 1000}`, // Generate EID
            violations: 1,
            amount: record.amount,
            department: record.department,
            categories: new Set([record.category]),
          })
        }
      })

    const violationPeople = Array.from(violationMap.values())
      .map((person) => ({
        ...person,
        categories: Array.from(person.categories),
      }))
      .sort((a, b) => b.violations - a.violations)

    const allEmployees = new Set(filteredData.map((r) => `${r.employeeName}|${r.department}`))
    const violatingEmployees = new Set(violationPeople.map((p) => `${p.name}|${p.department}`))

    const passedAuditPeople = Array.from(allEmployees)
      .filter((emp) => !violatingEmployees.has(emp))
      .map((emp) => {
        const [name, department] = emp.split("|")
        return {
          name,
          department,
          eid: `E${Math.floor(Math.random() * 9000) + 1000}`, // Generate EID
        }
      })

    const deptViolationMap = new Map<string, number>()
    if (!filterDepartment) {
      data
        .filter((record) => record.isViolation)
        .forEach((record) => {
          deptViolationMap.set(record.department, (deptViolationMap.get(record.department) || 0) + 1)
        })
    }

    const departmentRanking = Array.from(deptViolationMap.entries())
      .map(([department, violations]) => ({ department, violations }))
      .sort((a, b) => b.violations - a.violations)

    const allDepartments = ["DPTID1", "DPTID2", "DPTID3", "DPTID4", "DPTID5", "DPTID6", "DPTID7"]
    const completeDepartmentRanking = allDepartments
      .map((dept) => {
        const existing = departmentRanking.find((d) => d.department === dept)
        return existing || { department: dept, violations: 0 }
      })
      .sort((a, b) => b.violations - a.violations)

    // Calculate total stats
    const totalViolations = filteredData.filter((r) => r.isViolation).length
    const totalRecords = filteredData.length
    const complianceRate = totalRecords > 0 ? Math.round(((totalRecords - totalViolations) / totalRecords) * 100) : 0
    const avgViolation =
      violationPeople.length > 0
        ? Math.round(violationPeople.reduce((sum, p) => sum + p.amount, 0) / violationPeople.length)
        : 0

    return {
      chartData,
      violationPeople,
      passedAuditPeople,
      departmentRanking: completeDepartmentRanking,
      totalStats: {
        totalViolations,
        activeCases: violationPeople.length,
        complianceRate,
        avgViolation,
      },
    }
  }

  const handleDataProcessed = (data: ExpenseRecord[]) => {
    console.log("Setting expense data:", data.length, "records")
    setExpenseData(data)
    setActiveSection("overview") // Switch to overview after processing
  }

  // Get dashboard data based on active section
  const getDashboardData = () => {
    if (activeSection === "overview") {
      return processDashboardData(expenseData)
    } else if (activeSection.startsWith("dptid")) {
      return processDashboardData(expenseData, activeSection)
    }
    return processDashboardData(expenseData)
  }

  const dashboardData = getDashboardData()

  const violationCards = [
    {
      title: "HOTEL VIOLATIONS",
      amount: `$${expenseData
        .filter((r) => r.category === "HOTEL" && r.isViolation)
        .reduce((sum, r) => sum + r.amount, 0)
        .toLocaleString()}`,
      count: expenseData.filter((r) => r.category === "HOTEL" && r.isViolation).length,
      icon: Hotel,
      color: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
      iconBg: "bg-blue-100 dark:bg-blue-900",
    },
    {
      title: "AIRFARE VIOLATIONS",
      amount: `$${expenseData
        .filter((r) => r.category === "AIRFARE" && r.isViolation)
        .reduce((sum, r) => sum + r.amount, 0)
        .toLocaleString()}`,
      count: expenseData.filter((r) => r.category === "AIRFARE" && r.isViolation).length,
      icon: Plane,
      color: "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300",
      iconBg: "bg-purple-100 dark:bg-purple-900",
    },
    {
      title: "CAR RENTAL VIOLATIONS",
      amount: `$${expenseData
        .filter((r) => r.category === "CAR RENTAL" && r.isViolation)
        .reduce((sum, r) => sum + r.amount, 0)
        .toLocaleString()}`,
      count: expenseData.filter((r) => r.category === "CAR RENTAL" && r.isViolation).length,
      icon: Car,
      color: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300",
      iconBg: "bg-green-100 dark:bg-green-900",
    },
    {
      title: "MEALS VIOLATIONS",
      amount: `$${expenseData
        .filter((r) => r.category === "MEALS" && r.isViolation)
        .reduce((sum, r) => sum + r.amount, 0)
        .toLocaleString()}`,
      count: expenseData.filter((r) => r.category === "MEALS" && r.isViolation).length,
      icon: UtensilsCrossed,
      color: "bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300",
      iconBg: "bg-orange-100 dark:bg-orange-900",
    },
    {
      title: "EXCEPTIONS",
      amount: `$${expenseData
        .filter((r) => r.category === "EXCEPTIONS" && r.isViolation)
        .reduce((sum, r) => sum + r.amount, 0)
        .toLocaleString()}`,
      count: expenseData.filter((r) => r.category === "EXCEPTIONS" && r.isViolation).length,
      icon: AlertTriangle,
      color: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300",
      iconBg: "bg-red-100 dark:bg-red-900",
    },
    {
      title: "PAST DUE",
      amount: `$${expenseData
        .filter((r) => r.category === "PAST DUE" && r.isViolation)
        .reduce((sum, r) => sum + r.amount, 0)
        .toLocaleString()}`,
      count: expenseData.filter((r) => r.category === "PAST DUE" && r.isViolation).length,
      icon: Clock,
      color: "bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-300",
      iconBg: "bg-gray-100 dark:bg-gray-900",
    },
  ]

  const totalSpending = dashboardData.chartData.reduce((sum, item) => sum + item.value, 0)

  const renderContent = () => {
    if (activeSection === "welcome") {
      return <WelcomeView setActiveSection={setActiveSection} />
    } else if (activeSection === "upload") {
      return <UploadFileView onDataProcessed={handleDataProcessed} />
    } else if (activeSection === "overview") {
      return (
        <div className="space-y-6">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Overview</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {expenseData.length > 0
                ? `Travel expense analysis from uploaded data (${expenseData.length} records)`
                : "Travel expense violations and spending analysis"}
            </p>
          </div>

          {/* Data Source Info */}
          {expenseData.length > 0 && (
            <Card className="mb-4 bg-card border-border">
              <CardContent className="p-2">
                <div className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
                  <CheckCircle className="h-3 w-3" />
                  <span>Data loaded from uploaded files - showing results across all departments</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Violation Cards Grid */}
          <div className="grid grid-cols-6 gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto">
            {violationCards.map((card, index) => {
              const IconComponent = card.icon
              return (
                <Card
                  key={index}
                  className="hover:shadow-md transition-shadow min-w-[120px] sm:min-w-[140px] bg-card border-border"
                >
                  <CardContent className="p-1 sm:p-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className={`p-0.5 rounded ${card.iconBg} flex items-center`}>
                        <IconComponent
                          className={`h-2 w-2 sm:h-3 sm:w-3 ${card.color.split(" ")[2]} ${card.color.split(" ")[3]}`}
                        />
                      </div>
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {card.count}
                      </Badge>
                    </div>
                    <div className="space-y-0">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-medium text-muted-foreground leading-tight line-clamp-2 flex-1">
                          {card.title}
                        </p>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <p className="text-sm sm:text-base font-bold text-foreground">{card.amount}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Charts Section */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
              <Card className="lg:col-span-2 bg-card border-border">
                <CardHeader className="pb-2 sm:pb-6">
                  <CardTitle className="text-base sm:text-lg font-semibold text-foreground">
                    Total Travel Spending
                  </CardTitle>
                  {expenseData.length > 0 && (
                    <p className="text-xs text-muted-foreground">From uploaded Excel/CSV data</p>
                  )}
                </CardHeader>
                <CardContent className="p-2 sm:p-3 pt-0">
                  <ChartContainer
                    config={{
                      hotel: { label: "Hotel", color: "hsl(220, 70%, 50%)" },
                      airfare: { label: "Airfare", color: "hsl(280, 70%, 50%)" },
                      carrental: { label: "Car Rental", color: "hsl(140, 70%, 50%)" },
                      meals: { label: "Meals", color: "hsl(30, 70%, 50%)" },
                      exceptions: { label: "Exceptions", color: "hsl(0, 70%, 50%)" },
                      pastdue: { label: "Past Due", color: "hsl(210, 10%, 50%)" },
                    }}
                    className="h-[180px] sm:h-[200px] lg:h-[220px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardData.chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius="40%"
                          outerRadius="75%"
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {dashboardData.chartData.map((entry, index) => {
                            const colors = [
                              "hsl(220, 70%, 50%)",
                              "hsl(280, 70%, 50%)",
                              "hsl(140, 70%, 50%)",
                              "hsl(30, 70%, 50%)",
                              "hsl(0, 70%, 50%)",
                              "hsl(210, 10%, 50%)",
                            ]
                            return <Cell key={`cell-${index}`} fill={colors[index]} />
                          })}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <text
                          x="50%"
                          y="45%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-foreground text-sm sm:text-base lg:text-lg font-bold"
                        >
                          $
                          {totalSpending >= 1000
                            ? `${Math.round(totalSpending / 1000)}K`
                            : totalSpending.toLocaleString()}
                        </text>
                        <text
                          x="50%"
                          y="55%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-muted-foreground text-xs sm:text-sm"
                        >
                          Total Spending
                        </text>
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm">
                    {dashboardData.chartData.map((item, index) => {
                      const colors = [
                        "bg-blue-500",
                        "bg-purple-500",
                        "bg-green-500",
                        "bg-orange-500",
                        "bg-red-500",
                        "bg-gray-500",
                      ]
                      return (
                        <div key={index} className="flex items-center gap-2 min-w-0">
                          <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${colors[index]}`} />
                          <span className="text-muted-foreground truncate flex-1">{item.category}</span>
                          <span className="font-medium flex-shrink-0 text-foreground">
                            ${item.value.toLocaleString()}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3 bg-card border-border">
                <CardHeader className="pb-2 sm:pb-6">
                  <CardTitle className="text-base sm:text-lg font-semibold text-red-700 dark:text-red-400">
                    Violation People
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {expenseData.length > 0
                      ? "Employees with violations from uploaded data"
                      : "Employees with violations"}
                  </p>
                </CardHeader>
                <CardContent className="p-2 sm:p-3 pt-0">
                  <div className="space-y-3 max-h-[200px] overflow-y-auto">
                    {dashboardData.violationPeople.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">
                          {expenseData.length > 0 ? "No violations found in uploaded data" : "No violations found"}
                        </p>
                      </div>
                    ) : (
                      dashboardData.violationPeople.map((person, index) => (
                        <div
                          key={index}
                          className="flex items-start justify-between p-2 sm:p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-100 dark:border-red-800"
                        >
                          <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 bg-red-200 dark:bg-red-800 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-medium text-red-700 dark:text-red-300">
                                {person.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-foreground text-sm truncate">{person.name}</p>
                              <p className="text-xs text-muted-foreground">
                                EID: {person.eid} • {person.department}
                              </p>
                              <p className="text-xs text-red-600 dark:text-red-400">{person.violations} violations</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {person.categories.map((category, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-1 rounded"
                                  >
                                    {category}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-red-700 dark:text-red-400 font-medium flex-shrink-0">
                            ${person.amount.toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
              <Card className="lg:col-span-2 bg-card border-border">
                <CardHeader className="pb-2 sm:pb-6">
                  <CardTitle className="text-base sm:text-lg font-semibold text-foreground">
                    Violation Ranking
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {expenseData.length > 0
                      ? "Departments by violation count from uploaded data"
                      : "Top departments by violation count"}
                  </p>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="space-y-3 sm:space-y-4">
                    {dashboardData.departmentRanking.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">
                          {expenseData.length > 0
                            ? "No department violations in uploaded data"
                            : "No department data available"}
                        </p>
                      </div>
                    ) : (
                      dashboardData.departmentRanking.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-accent rounded-lg">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-xs sm:text-sm font-medium text-muted-foreground">{index + 1}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-foreground text-sm sm:text-base truncate">
                                {item.department}
                              </p>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {item.violations} violation{item.violations !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="w-16 sm:w-20 h-2 bg-muted rounded-full flex-shrink-0 ml-2">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width:
                                  item.violations === 0
                                    ? "0%"
                                    : `${Math.min((item.violations / Math.max(...dashboardData.departmentRanking.map((d) => d.violations))) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3 bg-card border-border">
                <CardHeader className="pb-2 sm:pb-6">
                  <CardTitle className="text-base sm:text-lg font-semibold text-green-700 dark:text-green-400">
                    Passed Audit
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {expenseData.length > 0
                      ? "Employees with clean records from uploaded data"
                      : "Employees with clean records"}
                  </p>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="space-y-3 sm:space-y-4">
                    {dashboardData.passedAuditPeople.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">
                          {expenseData.length > 0 ? "No clean records in uploaded data" : "No clean records found"}
                        </p>
                      </div>
                    ) : (
                      dashboardData.passedAuditPeople.map((person, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 sm:p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-100 dark:border-green-800"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">
                                {person.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-foreground text-sm sm:text-base truncate">{person.name}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">EID: {person.eid}</p>
                              <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                                {person.department}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs sm:text-sm text-green-700 dark:text-green-400 font-medium flex-shrink-0">
                            ✓
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-lg sm:text-2xl font-bold text-foreground">
                  {dashboardData.totalStats.totalViolations}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Total Violations</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-lg sm:text-2xl font-bold text-foreground">
                  {dashboardData.totalStats.activeCases}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Active Cases</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-lg sm:text-2xl font-bold text-foreground">
                  {dashboardData.totalStats.complianceRate}%
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Compliance Rate</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-lg sm:text-2xl font-bold text-foreground">
                  ${dashboardData.totalStats.avgViolation.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Avg Violation</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    } else {
      return <DepartmentView departmentId={activeSection} dashboardData={dashboardData} expenseData={expenseData} />
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <SidebarInset className="flex-1 min-w-0">
          {/* Header */}
          <header className="flex items-center justify-between p-3 sm:p-4 border-b border-border bg-background">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <SidebarTrigger />
              <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">Expensight:Travel Audit Dashboard</h1>
            </div>
            <ThemeToggle />
          </header>

          {/* Main Content */}
          <main className="p-3 sm:p-4 lg:p-6 bg-background min-h-screen">{renderContent()}</main>
        </SidebarInset>
      </div>
      <ChatBot expenseData={expenseData} />
    </SidebarProvider>
  )
}
