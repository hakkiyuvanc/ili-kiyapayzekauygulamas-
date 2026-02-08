import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatScreen } from "@/components/ChatScreen";
import { chatApi } from "@/lib/api";

// Mock the API
jest.mock("@/lib/api", () => ({
  chatApi: {
    getSessions: jest.fn(),
    getSession: jest.fn(),
    createSession: jest.fn(),
    sendMessage: jest.fn(),
  },
}));

describe("ChatScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (chatApi.getSessions as jest.Mock).mockResolvedValue({ data: [] });
  });

  describe("Rendering", () => {
    it("renders the chat interface with welcome message", async () => {
      render(<ChatScreen />);

      await waitFor(() => {
        expect(screen.getByText(/Merhaba! 💗/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/AMOR AI/i)).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Bir şeyler yaz/i),
      ).toBeInTheDocument();
    });

    it("renders quick action buttons when no messages", async () => {
      render(<ChatScreen />);

      await waitFor(() => {
        expect(screen.getByText(/İlişkimi geliştir/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Analiz önerileri/i)).toBeInTheDocument();
    });
  });

  describe("Session Management", () => {
    it("loads existing sessions on mount", async () => {
      const mockSessions = [
        { id: 1, title: "Sohbet 1", updated_at: "2024-01-01T00:00:00Z" },
        { id: 2, title: "Sohbet 2", updated_at: "2024-01-02T00:00:00Z" },
      ];

      (chatApi.getSessions as jest.Mock).mockResolvedValue({
        data: mockSessions,
      });

      render(<ChatScreen />);

      await waitFor(() => {
        expect(screen.getByText("Sohbet 1")).toBeInTheDocument();
      });

      expect(screen.getByText("Sohbet 2")).toBeInTheDocument();
    });

    it("creates new session when button is clicked", async () => {
      const mockNewSession = { id: 3, title: "Yeni Sohbet" };
      (chatApi.createSession as jest.Mock).mockResolvedValue({
        data: mockNewSession,
      });
      (chatApi.getSessions as jest.Mock).mockResolvedValue({
        data: [mockNewSession],
      });

      const user = userEvent.setup();
      render(<ChatScreen />);

      await waitFor(() => {
        expect(screen.getByText(/Yeni Sohbet/i)).toBeInTheDocument();
      });

      const newChatButton = screen.getAllByText(/Yeni Sohbet/i)[0];
      await user.click(newChatButton);

      await waitFor(() => {
        expect(chatApi.createSession).toHaveBeenCalledWith({
          title: "Yeni Sohbet",
          analysis_id: undefined,
        });
      });
    });

    it("loads messages when session is selected", async () => {
      const mockSessions = [
        { id: 1, title: "Sohbet 1", updated_at: "2024-01-01T00:00:00Z" },
      ];
      const mockMessages = [
        { id: 1, role: "user", content: "Merhaba" },
        {
          id: 2,
          role: "assistant",
          content: "Merhaba! Nasıl yardımcı olabilirim?",
        },
      ];

      (chatApi.getSessions as jest.Mock).mockResolvedValue({
        data: mockSessions,
      });
      (chatApi.getSession as jest.Mock).mockResolvedValue({
        data: { messages: mockMessages },
      });

      const user = userEvent.setup();
      render(<ChatScreen />);

      await waitFor(() => {
        expect(screen.getByText("Sohbet 1")).toBeInTheDocument();
      });

      const sessionButton = screen.getByText("Sohbet 1");
      await user.click(sessionButton);

      await waitFor(() => {
        expect(chatApi.getSession).toHaveBeenCalledWith(1);
      });

      await waitFor(() => {
        expect(screen.getByText("Merhaba")).toBeInTheDocument();
        expect(
          screen.getByText(/Nasıl yardımcı olabilirim/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Messaging", () => {
    it("does not send empty messages", async () => {
      const user = userEvent.setup();
      render(<ChatScreen />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Bir şeyler yaz/i),
        ).toBeInTheDocument();
      });

      const sendButton = screen.getByLabelText(/Mesaj gönder/i);
      await user.click(sendButton);

      expect(chatApi.sendMessage).not.toHaveBeenCalled();
    });

    it("sends message and displays response", async () => {
      const mockSession = { id: 1, title: "Test Session" };
      const mockResponse = {
        id: 2,
        role: "assistant",
        content: "AI yanıtı",
      };

      (chatApi.createSession as jest.Mock).mockResolvedValue({
        data: mockSession,
      });
      (chatApi.sendMessage as jest.Mock).mockResolvedValue({
        data: mockResponse,
      });

      const user = userEvent.setup();
      render(<ChatScreen />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Bir şeyler yaz/i),
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Bir şeyler yaz/i);
      await user.type(input, "Test mesajı");

      const sendButton = screen.getByLabelText(/Mesaj gönder/i);
      await user.click(sendButton);

      // User message should appear immediately (optimistic UI)
      expect(screen.getByText("Test mesajı")).toBeInTheDocument();

      await waitFor(() => {
        expect(chatApi.sendMessage).toHaveBeenCalledWith(1, "Test mesajı");
      });

      await waitFor(() => {
        expect(screen.getByText("AI yanıtı")).toBeInTheDocument();
      });

      // Input should be cleared
      expect(input).toHaveValue("");
    });

    it("creates session if none exists when sending message", async () => {
      const mockSession = { id: 1, title: "Yeni Sohbet" };
      const mockResponse = {
        id: 2,
        role: "assistant",
        content: "AI yanıtı",
      };

      (chatApi.createSession as jest.Mock).mockResolvedValue({
        data: mockSession,
      });
      (chatApi.sendMessage as jest.Mock).mockResolvedValue({
        data: mockResponse,
      });

      const user = userEvent.setup();
      render(<ChatScreen />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Bir şeyler yaz/i),
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Bir şeyler yaz/i);
      await user.type(input, "İlk mesaj");

      const sendButton = screen.getByLabelText(/Mesaj gönder/i);
      await user.click(sendButton);

      await waitFor(() => {
        expect(chatApi.createSession).toHaveBeenCalledWith({
          title: "Yeni Sohbet",
        });
      });

      await waitFor(() => {
        expect(chatApi.sendMessage).toHaveBeenCalledWith(1, "İlk mesaj");
      });
    });

    it("shows error message when API call fails", async () => {
      const mockSession = { id: 1, title: "Test Session" };

      (chatApi.createSession as jest.Mock).mockResolvedValue({
        data: mockSession,
      });
      (chatApi.sendMessage as jest.Mock).mockRejectedValue(
        new Error("API Error"),
      );

      const user = userEvent.setup();
      render(<ChatScreen />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Bir şeyler yaz/i),
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Bir şeyler yaz/i);
      await user.type(input, "Test mesajı");

      const sendButton = screen.getByLabelText(/Mesaj gönder/i);
      await user.click(sendButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Üzgünüm, bir hata oluştu/i),
        ).toBeInTheDocument();
      });
    });

    it("disables input and button while loading", async () => {
      const mockSession = { id: 1, title: "Test Session" };

      (chatApi.createSession as jest.Mock).mockResolvedValue({
        data: mockSession,
      });
      (chatApi.sendMessage as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      const user = userEvent.setup();
      render(<ChatScreen />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Bir şeyler yaz/i),
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Bir şeyler yaz/i);
      await user.type(input, "Test mesajı");

      const sendButton = screen.getByLabelText(/Mesaj gönder/i);
      await user.click(sendButton);

      expect(input).toBeDisabled();
      expect(sendButton).toBeDisabled();
    });
  });

  describe("Quick Actions", () => {
    it("fills input when quick action button is clicked", async () => {
      const user = userEvent.setup();
      render(<ChatScreen />);

      await waitFor(() => {
        expect(screen.getByText(/İlişkimi geliştir/i)).toBeInTheDocument();
      });

      const quickActionButton = screen.getByText(/İlişkimi geliştir/i);
      await user.click(quickActionButton);

      const input = screen.getByPlaceholderText(/Bir şeyler yaz/i);
      expect(input).toHaveValue("İlişkimizi nasıl geliştirebilirim?");
    });
  });

  describe("Initial Props", () => {
    it("loads session when initialSessionId is provided", async () => {
      const mockMessages = [{ id: 1, role: "user", content: "Merhaba" }];

      (chatApi.getSession as jest.Mock).mockResolvedValue({
        data: { messages: mockMessages },
      });

      render(<ChatScreen initialSessionId={1} />);

      await waitFor(() => {
        expect(chatApi.getSession).toHaveBeenCalledWith(1);
      });

      await waitFor(() => {
        expect(screen.getByText("Merhaba")).toBeInTheDocument();
      });
    });

    it("creates session with context when initialContextId is provided", async () => {
      const mockSession = { id: 1, title: "Yeni Sohbet" };

      (chatApi.createSession as jest.Mock).mockResolvedValue({
        data: mockSession,
      });

      render(<ChatScreen initialContextId={5} />);

      await waitFor(() => {
        expect(chatApi.createSession).toHaveBeenCalledWith({
          title: "Yeni Sohbet",
          analysis_id: 5,
        });
      });
    });
  });
});
