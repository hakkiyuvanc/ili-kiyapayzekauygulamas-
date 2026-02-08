import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AnalysisForm from "@/components/AnalysisForm";
import { analysisApi } from "@/lib/api";

// Mock the API
jest.mock("@/lib/api", () => ({
  analysisApi: {
    analyze: jest.fn(),
    uploadAndAnalyze: jest.fn(),
  },
}));

describe("AnalysisForm", () => {
  const mockOnAnalysisComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the form with default text mode", () => {
      render(<AnalysisForm onAnalysisComplete={mockOnAnalysisComplete} />);

      expect(screen.getByText("İlişki Analizi")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Ali: Merhaba nasılsın/),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Analiz Et/i }),
      ).toBeInTheDocument();
    });

    it("switches to file mode when file button is clicked", async () => {
      const user = userEvent.setup();
      render(<AnalysisForm onAnalysisComplete={mockOnAnalysisComplete} />);

      const fileButton = screen.getByRole("button", { name: /Dosya Yükle/i });
      await user.click(fileButton);

      expect(screen.getByText(/Dosya Seç/i)).toBeInTheDocument();
      expect(screen.getByText(/TXT, JSON, LOG veya ZIP/i)).toBeInTheDocument();
    });
  });

  describe("Text Mode Validation", () => {
    it("shows error when text is empty", async () => {
      const user = userEvent.setup();
      render(<AnalysisForm onAnalysisComplete={mockOnAnalysisComplete} />);

      const analyzeButton = screen.getByRole("button", { name: /Analiz Et/i });
      await user.click(analyzeButton);

      expect(
        screen.getByText(/Lütfen analiz edilecek metni girin/i),
      ).toBeInTheDocument();
    });

    it("shows error when text is too short", async () => {
      const user = userEvent.setup();
      render(<AnalysisForm onAnalysisComplete={mockOnAnalysisComplete} />);

      const textarea = screen.getByPlaceholderText(/Ali: Merhaba nasılsın/);
      await user.type(textarea, "Hi");

      const analyzeButton = screen.getByRole("button", { name: /Analiz Et/i });
      await user.click(analyzeButton);

      expect(screen.getByText(/Metin çok kısa/i)).toBeInTheDocument();
    });

    it("shows error when text has less than 3 words", async () => {
      const user = userEvent.setup();
      render(<AnalysisForm onAnalysisComplete={mockOnAnalysisComplete} />);

      const textarea = screen.getByPlaceholderText(/Ali: Merhaba nasılsın/);
      await user.type(textarea, "Merhaba dünya");

      const analyzeButton = screen.getByRole("button", { name: /Analiz Et/i });
      await user.click(analyzeButton);

      expect(screen.getByText(/en az 3 kelime gerekli/i)).toBeInTheDocument();
    });
  });

  describe("Text Mode Analysis", () => {
    it("successfully analyzes text and calls onAnalysisComplete", async () => {
      const user = userEvent.setup();
      const mockResponse = {
        data: {
          id: 1,
          overall_score: 85,
          sentiment_score: 90,
          empathy_score: 80,
          conflict_score: 10,
          we_language_score: 75,
          balance_score: 85,
          summary: "Test analysis",
        },
      };

      (analysisApi.analyze as jest.Mock).mockResolvedValue(mockResponse);

      render(<AnalysisForm onAnalysisComplete={mockOnAnalysisComplete} />);

      const textarea = screen.getByPlaceholderText(/Ali: Merhaba nasılsın/);
      await user.type(
        textarea,
        "Ali: Merhaba nasılsın? Ayşe: İyiyim teşekkürler.",
      );

      const analyzeButton = screen.getByRole("button", { name: /Analiz Et/i });
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(analysisApi.analyze).toHaveBeenCalledWith({
          text: "Ali: Merhaba nasılsın? Ayşe: İyiyim teşekkürler.",
          format_type: "auto",
          privacy_mode: true,
        });
      });

      await waitFor(() => {
        expect(mockOnAnalysisComplete).toHaveBeenCalledWith(mockResponse.data);
      });
    });

    it("shows error message when API call fails", async () => {
      const user = userEvent.setup();
      const errorMessage = "API Error";

      (analysisApi.analyze as jest.Mock).mockRejectedValue({
        response: { data: { detail: errorMessage } },
      });

      render(<AnalysisForm onAnalysisComplete={mockOnAnalysisComplete} />);

      const textarea = screen.getByPlaceholderText(/Ali: Merhaba nasılsın/);
      await user.type(
        textarea,
        "Ali: Merhaba nasılsın? Ayşe: İyiyim teşekkürler.",
      );

      const analyzeButton = screen.getByRole("button", { name: /Analiz Et/i });
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it("disables button and shows loading state during analysis", async () => {
      const user = userEvent.setup();

      (analysisApi.analyze as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      render(<AnalysisForm onAnalysisComplete={mockOnAnalysisComplete} />);

      const textarea = screen.getByPlaceholderText(/Ali: Merhaba nasılsın/);
      await user.type(
        textarea,
        "Ali: Merhaba nasılsın? Ayşe: İyiyim teşekkürler.",
      );

      const analyzeButton = screen.getByRole("button", { name: /Analiz Et/i });
      await user.click(analyzeButton);

      expect(screen.getByText(/Analiz Ediliyor/i)).toBeInTheDocument();
      expect(analyzeButton).toBeDisabled();
    });
  });

  describe("File Mode Validation", () => {
    it("shows error when no file is selected", async () => {
      const user = userEvent.setup();
      render(<AnalysisForm onAnalysisComplete={mockOnAnalysisComplete} />);

      const fileButton = screen.getByRole("button", { name: /Dosya Yükle/i });
      await user.click(fileButton);

      const analyzeButton = screen.getByRole("button", {
        name: /Dosyayı Analiz Et/i,
      });
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText(/Lütfen bir dosya seçin/i)).toBeInTheDocument();
      });
    });

    it("shows error for invalid file extension", async () => {
      const user = userEvent.setup();
      render(<AnalysisForm onAnalysisComplete={mockOnAnalysisComplete} />);

      const fileButton = screen.getByRole("button", { name: /Dosya Yükle/i });
      await user.click(fileButton);

      const file = new File(["test"], "test.pdf", { type: "application/pdf" });
      const input = screen.getByLabelText(/Dosya Seç/i, {
        selector: "input",
      }) as HTMLInputElement;

      // Use fireEvent for more reliable file upload simulation
      Object.defineProperty(input, "files", {
        value: [file],
        writable: false,
      });
      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByText(/Geçersiz dosya formatı/i)).toBeInTheDocument();
      });
    });

    it("shows error for file larger than 10MB", async () => {
      const user = userEvent.setup();
      render(<AnalysisForm onAnalysisComplete={mockOnAnalysisComplete} />);

      const fileButton = screen.getByRole("button", { name: /Dosya Yükle/i });
      await user.click(fileButton);

      // Mock a large file without creating actual content (faster)
      const largeFile = new File([""], "test.txt", { type: "text/plain" });
      Object.defineProperty(largeFile, "size", {
        value: 11 * 1024 * 1024, // 11MB
        writable: false,
      });

      const input = screen.getByLabelText(/Dosya Seç/i, {
        selector: "input",
      }) as HTMLInputElement;
      Object.defineProperty(input, "files", {
        value: [largeFile],
        writable: false,
      });
      fireEvent.change(input);

      await waitFor(() => {
        expect(
          screen.getByText(/10MB'dan küçük olmalıdır/i),
        ).toBeInTheDocument();
      });
    });

    it("accepts valid file and shows file info", async () => {
      const user = userEvent.setup();
      render(<AnalysisForm onAnalysisComplete={mockOnAnalysisComplete} />);

      const fileButton = screen.getByRole("button", { name: /Dosya Yükle/i });
      await user.click(fileButton);

      const file = new File(["test content"], "test.txt", {
        type: "text/plain",
      });
      const input = screen.getByLabelText(/Dosya Seç/i, {
        selector: "input",
      }) as HTMLInputElement;

      Object.defineProperty(input, "files", {
        value: [file],
        writable: false,
      });
      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByText(/test.txt/i)).toBeInTheDocument();
      });
    });
  });

  describe("File Mode Analysis", () => {
    it("successfully analyzes file and calls onAnalysisComplete", async () => {
      const user = userEvent.setup();
      const mockResponse = {
        data: {
          id: 1,
          overall_score: 85,
          summary: "Test file analysis",
        },
      };

      (analysisApi.uploadAndAnalyze as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      render(<AnalysisForm onAnalysisComplete={mockOnAnalysisComplete} />);

      const fileButton = screen.getByRole("button", { name: /Dosya Yükle/i });
      await user.click(fileButton);

      const file = new File(["test content"], "test.txt", {
        type: "text/plain",
      });
      const input = screen.getByLabelText(/Dosya Seç/i, {
        selector: "input",
      }) as HTMLInputElement;

      Object.defineProperty(input, "files", {
        value: [file],
        writable: false,
      });
      fireEvent.change(input);

      const analyzeButton = screen.getByRole("button", {
        name: /Dosyayı Analiz Et/i,
      });
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(analysisApi.uploadAndAnalyze).toHaveBeenCalledWith(file, true);
      });

      await waitFor(() => {
        expect(mockOnAnalysisComplete).toHaveBeenCalledWith(mockResponse.data);
      });
    });
  });
});
