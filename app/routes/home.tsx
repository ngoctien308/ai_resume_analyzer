import NavBar from "~/components/NavBar";
import type { Route } from "./+types/home";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Advanced, AI-powered feedback for your dream job!" },
  ];
}

export default function Home() {
  // if the user is not authenticated, redirect to /auth
  const navigate = useNavigate();
  const { auth, fs, kv } = usePuterStore();
  const [resumes, setResumes] = useState<Resume[]>([]);

  useEffect(() => {
    // set next variable to current path in order to redirect back after login
    if (!auth.isAuthenticated) navigate('/auth?next=/');
  }, [auth.isAuthenticated])

  useEffect(() => {
    const loadResumes = async () => {
      const resumes = (await kv.list('resume:*', true)) as KVItem[];
      const parsedResumes = resumes?.map((resume) => (
        JSON.parse(resume.value) as Resume
      ))

      setResumes(parsedResumes || []);
    }

    loadResumes();
  }, [])

  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <NavBar />

    <section className="main-section">
      <div className="page-heading py-16">
        <h1>Track Your Applications & Resume Ratings</h1>
        <h2>Review your submissions and check AI-powered feedback</h2>
      </div>

      {resumes.length > 0 && (
        <div className="resumes-section">
          {resumes.map((resume) => {
            return <ResumeCard key={resume.id} resume={resume} />
          })}
        </div>
      )}
    </section>
  </main>
}
