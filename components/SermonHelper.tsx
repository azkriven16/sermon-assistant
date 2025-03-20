"use client";

import type React from "react";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Trash2,
    Languages,
    Lightbulb,
    AlertTriangle,
    RefreshCw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ReactMarkdown from "react-markdown";

type BilingualContent = {
    english: string;
    hiligaynon: string;
};

type Message = {
    role: "user" | "assistant";
    content: string | BilingualContent;
    id: string;
    model?: string;
    isTyping?: boolean;
};

type ErrorState = {
    message: string;
    details?: string;
    suggestion?: string;
};

type SuggestionCategory = {
    name: string;
    englishName: string;
    hiligaynonName: string;
    suggestions: {
        english: string;
        hiligaynon: string;
    }[];
};

export default function SermonHelperSection() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<ErrorState | null>(null);
    const [language, setLanguage] = useState<"english" | "hiligaynon">(
        "english"
    );
    const [retryMessage, setRetryMessage] = useState<Message | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showAllSuggestions, setShowAllSuggestions] = useState(false);
    const [typingText, setTypingText] = useState("");
    const [fullResponse, setFullResponse] = useState<BilingualContent | null>(
        null
    );
    const [isTyping, setIsTyping] = useState(false);
    const typingSpeed = 10; // milliseconds per character

    // Sermon prompt suggestions with translations
    const suggestionCategories: SuggestionCategory[] = [
        {
            name: "themes",
            englishName: "Themes",
            hiligaynonName: "Mga Tema",
            suggestions: [
                {
                    english: "Create a sermon outline on God's love and grace",
                    hiligaynon:
                        "Maghimo sang outline sang sermon parte sa gugma kag grasya sang Dios",
                },
                {
                    english: "Help me write a sermon about forgiveness",
                    hiligaynon:
                        "Buligi ako maghimo sang sermon parte sa pagpatawad",
                },
                {
                    english: "Sermon ideas about faith during difficult times",
                    hiligaynon:
                        "Mga ideya sang sermon parte sa pagtuo sa malisod nga mga panahon",
                },
                {
                    english: "Biblical passages about community and fellowship",
                    hiligaynon:
                        "Mga berso sa Bibliya parte sa komunidad kag paghiliusa",
                },
                {
                    english: "Sermon on the importance of prayer",
                    hiligaynon: "Sermon parte sa importansya sang pangamuyo",
                },
            ],
        },
        {
            name: "occasions",
            englishName: "Occasions",
            hiligaynonName: "Mga Okasyon",
            suggestions: [
                {
                    english: "Easter Sunday sermon ideas",
                    hiligaynon: "Mga ideya sang sermon para sa Easter Sunday",
                },
                {
                    english: "Christmas message about the birth of Christ",
                    hiligaynon: "Mensahe sa Pasko parte sa pagkatawo ni Cristo",
                },
                {
                    english: "Wedding sermon about Christian marriage",
                    hiligaynon:
                        "Sermon sa kasal parte sa Kristohanon nga pag-asawahay",
                },
                {
                    english: "Funeral sermon of comfort and hope",
                    hiligaynon: "Sermon sa lubong parte sa kalipay kag paglaum",
                },
                {
                    english: "Youth Sunday sermon for teenagers",
                    hiligaynon: "Sermon sa Youth Sunday para sa mga tin-edyer",
                },
            ],
        },
        {
            name: "bible-studies",
            englishName: "Bible Studies",
            hiligaynonName: "Pagtuon sang Bibliya",
            suggestions: [
                {
                    english: "Explain the Beatitudes in Matthew 5",
                    hiligaynon: "Ipaathag ang Beatitudes sa Mateo 5",
                },
                {
                    english:
                        "Sermon points from the Parable of the Prodigal Son",
                    hiligaynon:
                        "Mga punto sang sermon halin sa Parabula sang Anak nga Naglayas",
                },
                {
                    english: "Key lessons from the Book of Psalms",
                    hiligaynon:
                        "Importante nga mga leksyon halin sa Libro sang Salmo",
                },
                {
                    english: "Sermon based on Romans 8:28",
                    hiligaynon: "Sermon base sa Roma 8:28",
                },
                {
                    english: "Explain 1 Corinthians 13 for a sermon on love",
                    hiligaynon:
                        "Ipaathag ang 1 Corinto 13 para sa sermon parte sa gugma",
                },
            ],
        },
    ];

    // Auto-scroll to bottom when messages change or typing occurs
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, typingText]);

    // Typing effect
    useEffect(() => {
        if (!isTyping || !fullResponse) return;

        const currentLanguageResponse =
            language === "english"
                ? fullResponse.english
                : fullResponse.hiligaynon;
        let currentIndex = 0;
        const responseLength = currentLanguageResponse.length;

        // Function to add the next character
        const addNextChar = () => {
            if (currentIndex < responseLength) {
                setTypingText(
                    currentLanguageResponse.substring(0, currentIndex + 1)
                );
                currentIndex++;
                setTimeout(addNextChar, typingSpeed);
            } else {
                // Typing is complete
                finishTyping();
            }
        };

        // Start the typing effect
        setTimeout(addNextChar, typingSpeed);

        return () => {
            // Cleanup if component unmounts during typing
            currentIndex = responseLength;
        };
    }, [isTyping, fullResponse, language]);

    // Function to finish typing and add the message
    const finishTyping = () => {
        setIsTyping(false);

        if (!fullResponse) return;

        // Add the complete message to the chat
        const assistantMessage: Message = {
            role: "assistant",
            content: fullResponse,
            id: Date.now().toString(),
            model: "gemini-1.5-flash", // This will be updated with the actual model from the response
        };

        setMessages((prev) => [
            ...prev.filter((m) => !m.isTyping),
            assistantMessage,
        ]);
        setFullResponse(null);
        setTypingText("");
    };

    const handleSubmit = async (
        e: React.FormEvent,
        retryingMessage?: Message
    ) => {
        e.preventDefault();

        // Clear any previous errors
        setError(null);

        // If we're retrying a message, use that content, otherwise use the input
        const messageContent = retryingMessage
            ? typeof retryingMessage.content === "string"
                ? retryingMessage.content
                : retryingMessage.content.english
            : input;

        if (!messageContent.trim()) return;

        // If not retrying, add the user message to the chat
        if (!retryingMessage) {
            const userMessage: Message = {
                role: "user",
                content: messageContent,
                id: Date.now().toString(),
            };

            setMessages((prev) => [...prev, userMessage]);
            setInput("");
        }

        // Add a temporary typing message
        const typingMessage: Message = {
            role: "assistant",
            content: "",
            id: "typing-" + Date.now().toString(),
            isTyping: true,
        };

        setMessages((prev) => [...prev, typingMessage]);
        setIsLoading(true);
        setRetryMessage(null);

        try {
            // Prepare messages for API
            const apiMessages = messages
                .filter((m) => !m.isTyping)
                .map((m) => ({
                    role: m.role,
                    content:
                        typeof m.content === "string"
                            ? m.content
                            : m.content[language],
                }));

            // Add the new message if not retrying
            if (!retryingMessage) {
                apiMessages.push({ role: "user", content: messageContent });
            }

            // Send the messages to the API
            const response = await fetch("/api/sermon", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: apiMessages,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to get response");
            }

            // Remove the typing indicator
            setMessages((prev) => prev.filter((m) => !m.isTyping));

            // Start the typing effect with the response
            setFullResponse(data.content);
            setIsTyping(true);

            // Store the model information for later
            const modelInfo = data.model;

            // Update the typing message with the model info
            setMessages((prev) => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.isTyping) {
                    return [
                        ...prev.slice(0, -1),
                        { ...lastMessage, model: modelInfo },
                    ];
                }
                return prev;
            });
        } catch (error: any) {
            console.error("Error:", error);

            // Remove the typing indicator
            setMessages((prev) => prev.filter((m) => !m.isTyping));

            // Set the error state with detailed information
            setError({
                message: error.message || "An error occurred",
                details: error.details,
                suggestion: error.suggestion || "Please try again later",
            });

            // Store the failed message for retry
            if (!retryingMessage) {
                setRetryMessage({
                    role: "user",
                    content: messageContent,
                    id: Date.now().toString(),
                });
            } else {
                setRetryMessage(retryingMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([]);
        setError(null);
        setRetryMessage(null);
        setTypingText("");
        setFullResponse(null);
        setIsTyping(false);
    };

    const usePromptSuggestion = useCallback((suggestion: string) => {
        setInput(suggestion);
    }, []);

    const toggleLanguage = () => {
        // Toggle the language
        setLanguage((prev) => (prev === "english" ? "hiligaynon" : "english"));

        // If we're currently typing, restart the typing effect with the new language
        if (isTyping && fullResponse) {
            setTypingText("");
            const currentLanguageResponse =
                language === "hiligaynon"
                    ? fullResponse.english
                    : fullResponse.hiligaynon;
            let currentIndex = 0;
            const responseLength = currentLanguageResponse.length;

            // Function to add the next character
            const addNextChar = () => {
                if (currentIndex < responseLength) {
                    setTypingText(
                        currentLanguageResponse.substring(0, currentIndex + 1)
                    );
                    currentIndex++;
                    setTimeout(addNextChar, typingSpeed);
                }
            };

            // Start the typing effect
            setTimeout(addNextChar, typingSpeed);
        }
    };

    const handleRetry = (e: React.FormEvent) => {
        if (retryMessage) {
            handleSubmit(e, retryMessage);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion);
    };

    // Component for the typing indicator
    const TypingIndicator = () => (
        <div className="flex space-x-2 items-center h-6">
            <div
                className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"
                style={{ animationDelay: "0ms" }}
            ></div>
            <div
                className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"
                style={{ animationDelay: "150ms" }}
            ></div>
            <div
                className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"
                style={{ animationDelay: "300ms" }}
            ></div>
        </div>
    );

    // Helper function to get suggestion text based on current language
    const getSuggestionText = (suggestion: {
        english: string;
        hiligaynon: string;
    }) => {
        return language === "english"
            ? suggestion.english
            : suggestion.hiligaynon;
    };

    // Helper function to get category name based on current language
    const getCategoryName = (category: SuggestionCategory) => {
        return language === "english"
            ? category.englishName
            : category.hiligaynonName;
    };

    // Helper function to get the appropriate content based on language
    const getMessageContent = (message: Message) => {
        if (typeof message.content === "string") {
            return message.content;
        }
        return language === "english"
            ? message.content.english
            : message.content.hiligaynon;
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <div className="flex flex-1 container mx-auto p-2 sm:p-4 pt-4 sm:pt-8">
                {/* Main Chat Area */}
                <div className="w-full max-w-3xl mx-auto">
                    <Card className="h-[90vh] sm:h-[80vh] flex flex-col">
                        <CardHeader className="p-3 sm:p-6">
                            {/* Mobile Header */}
                            <div className="flex flex-col sm:hidden space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-lg">
                                            Sermon Assistant
                                        </CardTitle>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Badge
                                            variant="outline"
                                            className={`${
                                                language === "english"
                                                    ? "bg-blue-100"
                                                    : "bg-green-100"
                                            } dark:text-black`}
                                        >
                                            {language === "english"
                                                ? "English"
                                                : "Hiligaynon"}
                                        </Badge>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={toggleLanguage}
                                            className="h-8 w-8 dark:bg-opacity-70"
                                        >
                                            <Languages className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={clearChat}
                                            disabled={
                                                messages.length === 0 ||
                                                isLoading
                                            }
                                            className="h-8 w-8"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <CardDescription className="text-xs">
                                    {language === "english"
                                        ? "Ask for help with sermon preparation, Bible study, or theological questions"
                                        : "Pangayo sang bulig sa paghanda sang sermon, pagtuon sang Bibliya."}
                                </CardDescription>
                            </div>

                            {/* Desktop Header */}
                            <div className="hidden sm:flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div>
                                        <CardTitle>Sermon Assistant</CardTitle>
                                        <CardDescription>
                                            {language === "english"
                                                ? "Ask for help with sermon preparation, Bible study, or theological questions"
                                                : "Pangayo sang bulig sa paghanda sang sermon, pagtuon sang Bibliya."}
                                        </CardDescription>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className={`${
                                            language === "english"
                                                ? "bg-blue-100"
                                                : "bg-green-100"
                                        } dark:text-black`}
                                    >
                                        {language === "english"
                                            ? "English"
                                            : "Hiligaynon"}
                                    </Badge>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={toggleLanguage}
                                                    title="Toggle language"
                                                >
                                                    <Languages className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Toggle response language</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={clearChat}
                                        disabled={
                                            messages.length === 0 || isLoading
                                        }
                                        title="Clear chat"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto space-y-4 h-0 px-3 sm:px-6">
                            {messages.length === 0 && !error && (
                                <div className="text-center text-muted-foreground my-8 flex flex-col items-center gap-2">
                                    <p className="text-lg font-medium">
                                        {language === "english"
                                            ? "Welcome to Sermon Helper"
                                            : "Maayong Pag-abot sa Sermon Helper"}
                                    </p>
                                    <p className="max-w-md text-sm sm:text-base">
                                        {language === "english"
                                            ? "Ask for help with sermon preparation, Bible study, or theological questions. You can also use the suggestion buttons below."
                                            : "Pangayo sang bulig sa paghanda sang sermon, pagtuon sang Bibliya.. Pwede ka man maggamit sang mga suggestion buttons sa idalom."}
                                    </p>
                                </div>
                            )}

                            {messages.map((m) => (
                                <div
                                    key={m.id}
                                    className={`flex ${
                                        m.role === "user"
                                            ? "justify-end"
                                            : "justify-start"
                                    }`}
                                >
                                    <div
                                        className={`max-w-[90%] sm:max-w-[80%] rounded-lg p-2 sm:p-3 ${
                                            m.role === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-card border border-border shadow-sm"
                                        }`}
                                    >
                                        {m.role === "user" ? (
                                            <div className="text-sm sm:text-base">
                                                {typeof m.content === "string"
                                                    ? m.content
                                                    : m.content[language]}
                                            </div>
                                        ) : m.isTyping ? (
                                            <TypingIndicator />
                                        ) : (
                                            <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
                                                <ReactMarkdown>
                                                    {getMessageContent(m)}
                                                </ReactMarkdown>
                                                {m.model && (
                                                    <div className="mt-2 text-xs text-muted-foreground">
                                                        Generated with {m.model}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Typing effect message */}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="max-w-[90%] sm:max-w-[80%] rounded-lg p-2 sm:p-3 bg-card border border-border shadow-sm">
                                        <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm">
                                            <ReactMarkdown>
                                                {typingText}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <Alert variant="destructive" className="mb-4">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>
                                        Error: {error.message}
                                    </AlertTitle>
                                    <AlertDescription>
                                        <p>{error.details}</p>
                                        {error.suggestion && (
                                            <p className="mt-2">
                                                {error.suggestion}
                                            </p>
                                        )}
                                        {retryMessage && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-2"
                                                onClick={handleRetry}
                                                disabled={isLoading}
                                            >
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                Retry
                                            </Button>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Invisible element for auto-scrolling */}
                            <div ref={messagesEndRef} />
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-3 p-3 sm:p-6">
                            {/* Sermon Ideas Section - Only show when not typing */}
                            {!isTyping && (
                                <div className="w-full">
                                    <h3 className="font-medium mb-2 flex items-center gap-2 text-xs sm:text-sm">
                                        <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4" />
                                        {language === "english"
                                            ? "Sermon Ideas"
                                            : "Mga Ideya sang Sermon"}
                                    </h3>
                                    <div className="flex flex-wrap gap-1 sm:gap-2">
                                        {suggestionCategories.flatMap(
                                            (category) =>
                                                category.suggestions
                                                    .slice(0, 2)
                                                    .map(
                                                        (suggestion, index) => {
                                                            const text =
                                                                getSuggestionText(
                                                                    suggestion
                                                                );
                                                            return (
                                                                <Button
                                                                    key={`${category.name}-${index}`}
                                                                    variant="outline"
                                                                    className="text-[10px] sm:text-xs py-1 px-2 h-auto"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleSuggestionClick(
                                                                            text
                                                                        )
                                                                    }
                                                                >
                                                                    {text.length >
                                                                    20
                                                                        ? text.substring(
                                                                              0,
                                                                              17
                                                                          ) +
                                                                          "..."
                                                                        : text}
                                                                </Button>
                                                            );
                                                        }
                                                    )
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-[10px] sm:text-xs py-1 px-2 h-auto"
                                            onClick={() =>
                                                setShowAllSuggestions(
                                                    !showAllSuggestions
                                                )
                                            }
                                        >
                                            {showAllSuggestions
                                                ? language === "english"
                                                    ? "Show Less ..."
                                                    : "Ipakita ang Mas Diutay ..."
                                                : language === "english"
                                                ? "More Ideas..."
                                                : "Mas Madamo nga Ideya..."}
                                        </Button>
                                    </div>

                                    {/* Expanded Suggestions */}
                                    {showAllSuggestions && (
                                        <div className="mt-2 sm:mt-3 border-t pt-2 sm:pt-3">
                                            <Tabs
                                                defaultValue={
                                                    suggestionCategories[0].name
                                                }
                                            >
                                                <TabsList className="w-full">
                                                    {suggestionCategories.map(
                                                        (category) => (
                                                            <TabsTrigger
                                                                key={
                                                                    category.name
                                                                }
                                                                value={
                                                                    category.name
                                                                }
                                                                className="flex-1 text-[10px] sm:text-xs"
                                                            >
                                                                {getCategoryName(
                                                                    category
                                                                )}
                                                            </TabsTrigger>
                                                        )
                                                    )}
                                                </TabsList>
                                                {suggestionCategories.map(
                                                    (category) => (
                                                        <TabsContent
                                                            key={category.name}
                                                            value={
                                                                category.name
                                                            }
                                                            className="mt-2"
                                                        >
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                                                                {category.suggestions.map(
                                                                    (
                                                                        suggestion,
                                                                        index
                                                                    ) => {
                                                                        const text =
                                                                            getSuggestionText(
                                                                                suggestion
                                                                            );
                                                                        return (
                                                                            <Button
                                                                                key={
                                                                                    index
                                                                                }
                                                                                variant="outline"
                                                                                className="justify-start h-auto py-1 px-2 text-left text-[10px] sm:text-xs"
                                                                                onClick={() =>
                                                                                    handleSuggestionClick(
                                                                                        text
                                                                                    )
                                                                                }
                                                                            >
                                                                                {
                                                                                    text
                                                                                }
                                                                            </Button>
                                                                        );
                                                                    }
                                                                )}
                                                            </div>
                                                        </TabsContent>
                                                    )
                                                )}
                                            </Tabs>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Input Form - Always visible */}
                            <form
                                onSubmit={(e) => handleSubmit(e)}
                                className="flex w-full space-x-2"
                            >
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={
                                        language === "english"
                                            ? "Type your sermon question..."
                                            : "I-type ang imo pamangkot..."
                                    }
                                    className="flex-grow text-sm"
                                    disabled={isLoading || isTyping}
                                />
                                <Button
                                    type="submit"
                                    disabled={isLoading || isTyping}
                                    className="whitespace-nowrap text-xs sm:text-sm"
                                >
                                    {isLoading
                                        ? language === "english"
                                            ? "Sending..."
                                            : "Ginapadala..."
                                        : language === "english"
                                        ? "Send"
                                        : "Ipadala"}
                                </Button>
                            </form>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
