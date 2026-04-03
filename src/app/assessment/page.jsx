"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const QUIZZES = {
  "Stress Check": [
    "In the last week, how often have you felt overwhelmed by your responsibilities?",
    "How frequently do you find it hard to wind down and relax?",
    "Are you experiencing physical symptoms like tension, headaches, or upset stomach?",
  ],
  "Anxiety Level": [
    "How often do you feel nervous, anxious, or on edge?",
    "Do you find yourself worrying too much about different things?",
    "How often do you have trouble relaxing or feeling peaceful?",
  ],
  "Sleep Quality": [
    "How often do you have trouble falling asleep at night?",
    "Do you wake up feeling unrefreshed or exhausted?",
    "How frequently do your thoughts keep you awake?",
  ]
};

const OPTIONS = ["Never", "Sometimes", "Often", "Almost Always"];

export default function Assessment() {
  const [view, setView] = useState("list");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [severityLabel, setSeverityLabel] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [currentQuizType, setCurrentQuizType] = useState("Stress Check");

  const startQuiz = (type) => {
    setCurrentQuizType(type);
    setView("active");
    setCurrentQ(0);
    setAnswers([]);
  };

  const handleAnswer = (optionIdx) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIdx;
    setAnswers(newAnswers);
  };

  const handeNext = async () => {
    const questions = QUIZZES[currentQuizType];
    if (answers[currentQ] === undefined || isSaving) return;
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setIsSaving(true);
      const averageScore = answers.reduce((a, b) => a + b, 0) / answers.length;
      const severity = averageScore < 1 ? "Low" : averageScore <= 2 ? "Moderate" : "High";
      setSeverityLabel(severity);

      const newAssessment = {
        type: currentQuizType,
        date: new Date().toISOString(),
        score: averageScore,
        severity,
        answers
      };

      try {
        await fetch("/api/assessment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAssessment)
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
        setView("result");
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-10">
      <div>
        <h2 className="text-3xl font-heading font-bold text-foreground">
          Self-Assessment
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Light insight tools to help you understand your current state.
        </p>
      </div>

      <div className="bg-secondary/40 rounded-2xl p-4 flex items-start gap-4 mb-6 border border-border/50 text-sm">
        <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-muted-foreground leading-relaxed">
          <strong>Light Insight Only.</strong> These assessments are not
          diagnostic tools. They are simply designed to help you reflect on your
          feelings. If you are deeply struggling, please visit the Crisis
          Support page.
        </p>
      </div>

      {view === "list" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-0 shadow-sm ring-1 ring-border/50 hover:ring-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Stress Check
              </CardTitle>
              <CardDescription>
                Reflect on your current stress points (10 questions)
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => startQuiz("Stress Check")} className="w-full rounded-full">
                Start Assessment <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-0 shadow-sm ring-1 ring-border/50 hover:ring-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-500" /> Anxiety Level
              </CardTitle>
              <CardDescription>
                Check in on feelings of unease (7 questions)
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full rounded-full bg-secondary/20"
                onClick={() => startQuiz("Anxiety Level")}
              >
                Start Assessment <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-0 shadow-sm ring-1 ring-border/50 hover:ring-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-500" /> Sleep Quality
              </CardTitle>
              <CardDescription>
                Understand your rest patterns (5 questions)
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full rounded-full bg-secondary/20"
                onClick={() => startQuiz("Sleep Quality")}
              >
                Start Assessment <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {view === "active" && (
        <Card className="border-0 shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="text-muted-foreground">
                {currentQuizType}
              </Badge>
              <span className="text-sm font-medium text-muted-foreground">
                {currentQ + 1} / {QUIZZES[currentQuizType].length}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mb-6">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{
                  width: `${((currentQ + 1) / QUIZZES[currentQuizType].length) * 100}%`,
                }}
              ></div>
            </div>
            <CardTitle className="text-xl md:text-2xl leading-snug">
              {QUIZZES[currentQuizType][currentQ]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {OPTIONS.map((opt, idx) => {
              const isSelected = answers[currentQ] === idx;
              return (
                <div
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${isSelected ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30 hover:bg-secondary/20"}`}
                >
                  <span
                    className={`font-medium ${isSelected ? "text-primary" : "text-foreground"}`}
                  >
                    {opt}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-primary" : "border-muted-foreground"}`}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
          <CardFooter className="pt-6 border-t border-border/50 mt-4">
            <Button
              className="w-full rounded-full h-12"
              onClick={handeNext}
              disabled={answers[currentQ] === undefined || isSaving}
            >
              {isSaving ? "Saving..." : currentQ === QUIZZES[currentQuizType].length - 1 ? "Finish" : "Next"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {view === "result" && (
        <Card className="border-0 shadow-sm ring-1 ring-border/50 bg-[#FFF9C4]/30 overflow-hidden">
          <div className="h-2 w-full bg-[#FBC02D]"></div>
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-[#FBC02D]/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-[#FBC02D]" />
            </div>
            <Badge className="mx-auto bg-[#FBC02D] hover:bg-[#FBC02D] text-[#82610A] mb-2">
              Analysis Complete
            </Badge>
            <CardTitle className="text-2xl">
              {severityLabel} {currentQuizType.toLowerCase().replace(' check', '').replace(' level', '').replace(' quality', '')} detected {severityLabel === "Low" ? "🟢" : severityLabel === "Moderate" ? "🟡" : "🔴"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6 pt-4">
            <p className="text-muted-foreground">
              Based on your answers, you are carrying a {severityLabel.toLowerCase()} level of
              difficulty with {currentQuizType.toLowerCase()} right now. {severityLabel === "Low" ? "Keep up the good work!" : "While this is very human and common, it's a good gentle sign to prioritize your wellbeing."}
            </p>

            <div className="bg-white p-4 rounded-2xl text-left border border-[#FBC02D]/30 inline-block">
              <h4 className="font-semibold text-sm mb-2 text-[#82610A]">
                Suggested next steps:
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span>🌬️</span> Do a 3-minute Box Breathing session
                </li>
                <li className="flex items-center gap-2">
                  <span>🚶‍♀️</span> Take a short 10-minute walk away from screens
                </li>
                <li className="flex items-center gap-2">
                  <span>💬</span> Talk to your AI companion about what's
                  overwhelming you
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              className="w-full rounded-full"
              onClick={() => (window.location.href = "/tools")}
            >
              Go to Guided Tools
            </Button>
            <Button
              variant="ghost"
              className="w-full rounded-full text-muted-foreground"
              onClick={() => setView("list")}
            >
              Back to Assessments
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
