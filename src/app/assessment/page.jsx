"use client";

import { useState, useMemo } from "react";
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
  Brain,
  Moon,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { label: "Never", score: 0 },
  { label: "Sometimes", score: 1 },
  { label: "Often", score: 2 },
  { label: "Almost always", score: 3 },
];

/** @typedef {'Stress Check' | 'Anxiety Check' | 'Sleep Quality'} QuizType */

/** @type {Record<QuizType, { key: string; description: string; icon: typeof Zap; accent: string; questions: string[] }>} */
const ASSESSMENTS = {
  "Stress Check": {
    key: "stress",
    description:
      "Explore how pressure, tension, and overload may be showing up lately.",
    icon: Zap,
    accent: "text-rose-500",
    questions: [
      "In the past two weeks, how often have you felt overwhelmed by everything you had to do?",
      "How often have you found it hard to relax or “switch off” after work, study, or caregiving?",
      "How often have you felt irritable, snappy, or on edge with people around you?",
      "How often have headaches, muscle tension, or stomach discomfort bothered you?",
      "How often have you felt you could not cope with all that was asked of you?",
      "How often have worries about the future made it hard to focus on the present?",
      "How often has stress made it harder to sleep or stay asleep?",
      "How often have you put off tasks because they felt too demanding?",
      "How often have you felt mentally or emotionally drained by the end of the day?",
      "How often have you felt that small problems were “too much” to handle?",
    ],
  },
  "Anxiety Check": {
    key: "anxiety",
    description:
      "A gentle check-in on worry, nervousness, and how your body responds.",
    icon: Brain,
    accent: "text-violet-500",
    questions: [
      "How often have you felt nervous, anxious, or on edge?",
      "How often have you been unable to stop or control worrying?",
      "How often have you worried too much about different things at once?",
      "How often have you had trouble relaxing, even when you had time to rest?",
      "How often have you felt so restless that sitting still was difficult?",
      "How often have you felt easily annoyed or irritable?",
      "How often have you felt afraid that something bad might happen?",
      "How often have worries made it hard to concentrate on what you were doing?",
      "How often have physical signs (racing heart, tight chest, sweating) come with worry?",
      "How often have you avoided situations because they made you anxious?",
    ],
  },
  "Sleep Quality": {
    key: "sleep",
    description:
      "Look at how rest, timing, and nighttime thoughts affect your days.",
    icon: Moon,
    accent: "text-indigo-500",
    questions: [
      "How often have you had trouble falling asleep within a reasonable time?",
      "How often have you woken during the night and struggled to fall back asleep?",
      "How often have you woken earlier than you wanted and could not get back to sleep?",
      "How often have you felt unrefreshed or tired after a full night in bed?",
      "How often has daytime sleepiness affected your mood, focus, or safety (e.g. driving)?",
      "How often have racing thoughts or worry kept you awake?",
      "How often has your sleep schedule felt irregular (very different bed or wake times)?",
      "How often have late screens, caffeine, or stimulation affected your sleep?",
      "How often have vivid or unsettling dreams left you tired the next day?",
      "How often has poor sleep clearly impacted your daily activities or relationships?",
    ],
  },
};

/**
 * @param {number} totalScore — sum of item scores (0–3 each), 10 items → 0–30
 */
function severityFromTotal(totalScore) {
  const avg = totalScore / 10;
  if (avg < 1) return "Low";
  if (avg <= 2) return "Moderate";
  return "High";
}

/**
 * @param {QuizType} type
 * @param {'Low' | 'Moderate' | 'High'} severity
 */
function getInsights(type, severity) {
  const common =
    "This is a self-reflection exercise, not a diagnosis. If you feel unsafe or in crisis, use Crisis Support right away.";

  /** @type {Record<QuizType, Record<string, { headline: string; body: string; tips: string[] }>>} */
  const map = {
    "Stress Check": {
      Low: {
        headline: "Stress load looks relatively manageable right now",
        body: "Your answers suggest stress is present but not dominating most days. That is a good sign—and worth protecting with small habits before pressure builds.",
        tips: [
          "Keep one short daily “unplug” block (no tasks, no news) to preserve balance.",
          "Name your top three priorities each morning so demands feel less chaotic.",
          "When tension shows up, try two minutes of slow breathing before you react.",
        ],
      },
      Moderate: {
        headline: "Stress seems to be a steady companion lately",
        body: "You may be carrying a noticeable load—mentally, physically, or both. Many people land here during busy seasons; it is a useful signal to adjust pace and support.",
        tips: [
          "Cut one non-essential commitment this week if you can, without guilt.",
          "Schedule recovery like you schedule work: sleep, movement, and real breaks.",
          "Use Guided Tools (e.g. grounding or breathing) when overload spikes.",
        ],
      },
      High: {
        headline: "Stress appears to be running high",
        body: "Your responses suggest you may be stretched thin often. That is exhausting and deserves attention—noticing it is an important first step.",
        tips: [
          "Tell someone you trust how heavy things feel; you do not have to carry it alone.",
          "Consider professional support if stress is affecting sleep, health, or daily life.",
          "Reduce “always on” time: boundaries on messages and work protect your nervous system.",
        ],
      },
    },
    "Anxiety Check": {
      Low: {
        headline: "Worry and nervousness seem relatively mild for now",
        body: "Your pattern looks more settled. Still, anxiety can fluctuate; gentle skills now can help you stay steadier when life shifts.",
        tips: [
          "Notice early signs (restlessness, tight shoulders) and respond with calm activity.",
          "Limit doom-scrolling; short walks after stressful news can help your body reset.",
          "If something specific worries you, write one next small step instead of spinning.",
        ],
      },
      Moderate: {
        headline: "Anxiety may be taking up more space than you would like",
        body: "Worry, tension, or avoidance might be showing up regularly. That is very common—and there are effective ways to soften the cycle.",
        tips: [
          "Try labeling thoughts (“I am having a worried thought”) to create a little distance.",
          "Pair worry time with action: one concrete step, then redirect to the present.",
          "If symptoms persist for weeks or disrupt sleep, a clinician can offer proven options.",
        ],
      },
      High: {
        headline: "Anxiety looks like it is affecting you strongly",
        body: "Your answers point to frequent unease or fear-driven patterns. You deserve support; anxiety is treatable, and reaching out is a sign of strength.",
        tips: [
          "Prioritize speaking with a qualified mental health professional if you have not yet.",
          "Reduce caffeine and late-night stimulation if panic or racing heart shows up.",
          "Use crisis resources if you ever feel you might hurt yourself or cannot cope.",
        ],
      },
    },
    "Sleep Quality": {
      Low: {
        headline: "Sleep seems fairly stable overall",
        body: "You may still have off nights, but rest does not look severely disrupted. Small consistency habits can keep it that way.",
        tips: [
          "Keep a similar wake time daily, even after a poor night, to anchor your rhythm.",
          "Dim lights and screens 45–60 minutes before bed when you can.",
          "Reserve the bed for sleep and intimacy—not for stressful work or arguments.",
        ],
      },
      Moderate: {
        headline: "Sleep may be uneven or not quite restorative",
        body: "Tiredness, broken sleep, or racing thoughts at night can wear you down. Addressing sleep often lifts mood and stress at the same time.",
        tips: [
          "Try a wind-down routine: same order of quiet activities each night.",
          "Limit naps to 20 minutes and not too late in the day.",
          "If worry keeps you awake, jot a “tomorrow list” on paper, then close the notebook.",
        ],
      },
      High: {
        headline: "Sleep looks significantly disrupted",
        body: "Poor sleep can affect everything—energy, mood, and coping. If this has gone on a while, it is worth treating sleep as a health priority.",
        tips: [
          "Consider discussing insomnia or suspected sleep disorders with a clinician.",
          "Keep the bedroom cool, dark, and quiet; get light exposure soon after waking.",
          "Avoid using alcohol to fall asleep; it fragments sleep later in the night.",
        ],
      },
    },
  };

  const block = map[type][severity];
  return {
    headline: block.headline,
    body: `${block.body} ${common}`,
    tips: block.tips,
  };
}

export default function Assessment() {
  const [view, setView] = useState("list");
  const [currentQ, setCurrentQ] = useState(0);
  /** @type {number[]} scores 0–3 per question */
  const [answers, setAnswers] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  /** @type {QuizType} */
  const [currentQuizType, setCurrentQuizType] = useState("Stress Check");
  const [resultInsights, setResultInsights] = useState(
    /** @type {{ severity: string; totalScore: number; headline: string; body: string; tips: string[] } | null} */ (
      null
    ),
  );

  const quizMeta = ASSESSMENTS[currentQuizType];
  const questions = quizMeta.questions;

  const startQuiz = (/** @type {QuizType} */ type) => {
    setCurrentQuizType(type);
    setView("active");
    setCurrentQ(0);
    setAnswers([]);
    setResultInsights(null);
  };

  const exitToList = () => {
    setView("list");
    setCurrentQ(0);
    setAnswers([]);
  };

  const handleAnswer = (score) => {
    const next = [...answers];
    next[currentQ] = score;
    setAnswers(next);
  };

  const handleNext = async () => {
    if (answers[currentQ] === undefined || isSaving) return;
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      return;
    }

    setIsSaving(true);
    const totalScore = answers.reduce((a, b) => a + b, 0);
    const severity = severityFromTotal(totalScore);
    const insights = getInsights(currentQuizType, severity);
    setResultInsights({
      severity,
      totalScore,
      headline: insights.headline,
      body: insights.body,
      tips: insights.tips,
    });

    const newAssessment = {
      type: currentQuizType,
      date: new Date().toISOString(),
      score: totalScore / 10,
      totalScore,
      questionCount: questions.length,
      severity,
      answers,
    };

    try {
      await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAssessment),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
      setView("result");
    }
  };

  const severityBadgeClass = useMemo(() => {
    if (!resultInsights) return "";
    if (resultInsights.severity === "Low")
      return "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30";
    if (resultInsights.severity === "Moderate")
      return "bg-amber-500/15 text-amber-900 dark:text-amber-200 border-amber-500/30";
    return "bg-rose-500/15 text-rose-900 dark:text-rose-200 border-rose-500/30";
  }, [resultInsights]);

  const listEntries = /** @type {QuizType[]} */ ([
    "Stress Check",
    "Anxiety Check",
    "Sleep Quality",
  ]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-10">
      <div>
        <h2 className="text-3xl font-heading font-bold text-foreground">
          Self-Assessment
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Choose one short screening. Each has 10 questions and takes only a few
          minutes.
        </p>
      </div>

      <div className="bg-secondary/40 rounded-2xl p-4 flex items-start gap-4 border border-border/50 text-sm">
        <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-muted-foreground leading-relaxed">
          <strong>For reflection only.</strong> These tools are not medical or
          diagnostic. If you are in immediate danger or crisis, go to{" "}
          <a href="/crisis" className="text-primary font-medium underline-offset-2 hover:underline">
            Crisis Support
          </a>
          .
        </p>
      </div>

      {view === "list" && (
        <div className="grid gap-4 md:grid-cols-3">
          {listEntries.map((type) => {
            const meta = ASSESSMENTS[type];
            const Icon = meta.icon;
            return (
              <Card
                key={type}
                className="border-0 shadow-sm ring-1 ring-border/50 hover:ring-primary/40 transition-colors flex flex-col"
              >
                <CardHeader className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon className={cn("h-5 w-5", meta.accent)} />
                    {type}
                  </CardTitle>
                  <CardDescription>{meta.description}</CardDescription>
                  <p className="text-xs text-muted-foreground pt-2">
                    10 questions · 4-point scale
                  </p>
                </CardHeader>
                <CardFooter className="border-t-0 bg-transparent pt-0">
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full rounded-full bg-secondary/30",
                      "hover:bg-primary hover:text-primary-foreground hover:border-primary",
                    )}
                    onClick={() => startQuiz(type)}
                  >
                    Start <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {view === "active" && (
        <Card className="border-0 shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full -ml-2 text-muted-foreground"
                onClick={exitToList}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Choose another test
              </Button>
              <span className="text-sm font-medium text-muted-foreground">
                {currentQ + 1} / {questions.length}
              </span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="text-muted-foreground">
                {currentQuizType}
              </Badge>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mb-6">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{
                  width: `${((currentQ + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
            <CardTitle className="text-xl md:text-2xl leading-snug font-heading">
              {questions[currentQ]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {OPTIONS.map((opt) => {
              const isSelected = answers[currentQ] === opt.score;
              return (
                <button
                  type="button"
                  key={opt.label}
                  onClick={() => handleAnswer(opt.score)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-primary/30 hover:bg-secondary/20",
                  )}
                >
                  <span
                    className={cn(
                      "font-medium",
                      isSelected ? "text-primary" : "text-foreground",
                    )}
                  >
                    {opt.label}
                  </span>
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                      isSelected ? "border-primary" : "border-muted-foreground",
                    )}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                </button>
              );
            })}
          </CardContent>
          <CardFooter className="pt-6 border-t border-border/50 mt-4">
            <Button
              className="w-full rounded-full h-12"
              onClick={handleNext}
              disabled={answers[currentQ] === undefined || isSaving}
            >
              {isSaving
                ? "Saving…"
                : currentQ === questions.length - 1
                  ? "See results"
                  : "Next"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {view === "result" && resultInsights && (
        <Card className="border-0 shadow-sm ring-1 ring-border/50 overflow-hidden">
          <div
            className={cn(
              "h-1.5 w-full",
              resultInsights.severity === "Low" && "bg-emerald-500/80",
              resultInsights.severity === "Moderate" && "bg-amber-500/80",
              resultInsights.severity === "High" && "bg-rose-500/80",
            )}
          />
          <CardHeader className="text-center pb-2 pt-8">
            <div
              className={cn(
                "mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4",
                resultInsights.severity === "Low" && "bg-emerald-500/15",
                resultInsights.severity === "Moderate" && "bg-amber-500/15",
                resultInsights.severity === "High" && "bg-rose-500/15",
              )}
            >
              <CheckCircle2
                className={cn(
                  "h-8 w-8",
                  resultInsights.severity === "Low" && "text-emerald-600 dark:text-emerald-400",
                  resultInsights.severity === "Moderate" &&
                    "text-amber-600 dark:text-amber-400",
                  resultInsights.severity === "High" && "text-rose-600 dark:text-rose-400",
                )}
              />
            </div>
            <Badge
              variant="outline"
              className={cn("mx-auto mb-3 border", severityBadgeClass)}
            >
              {resultInsights.severity} level · {currentQuizType}
            </Badge>
            <CardTitle className="text-xl md:text-2xl font-heading leading-snug px-2">
              {resultInsights.headline}
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground pt-3 max-w-lg mx-auto">
              Score summary: {resultInsights.totalScore} / 30 (higher suggests
              more frequent or intense experiences in this area).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-2 max-w-2xl mx-auto">
            <p className="text-sm md:text-base text-foreground/90 leading-relaxed">
              {resultInsights.body}
            </p>
            <div className="bg-secondary/40 p-5 rounded-2xl text-left border border-border/50">
              <h4 className="font-semibold text-sm mb-3 text-foreground">
                Suggestions for you
              </h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {resultInsights.tips.map((tip) => (
                  <li key={tip} className="flex gap-3 leading-relaxed">
                    <span className="text-primary font-bold shrink-0">·</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 max-w-md mx-auto w-full pb-8">
            <Button className="w-full rounded-full" asChild>
              <a href="/companion">Chat with AI Companion</a>
            </Button>
            <Button className="w-full rounded-full" variant="secondary" asChild>
              <a href="/tools">Open Guided Tools</a>
            </Button>
            <Button
              variant="ghost"
              className="w-full rounded-full text-muted-foreground"
              onClick={() => {
                setView("list");
                setResultInsights(null);
              }}
            >
              Back to assessments
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
