'use client';

import { useQuery } from '@tanstack/react-query';
import { getJobs } from '@/lib/api';
import { BookOpen, Loader2, AlertCircle, Play } from 'lucide-react';

export default function Home() {
  const { data: jobs, isLoading, isError, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: getJobs,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Hero */}
      <div className="text-center mb-14">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BookOpen className="w-10 h-10 text-amber-400" />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Hush<span className="text-amber-400">Tales</span>
          </h1>
        </div>
        <p className="text-white/60 text-lg max-w-xl mx-auto">
          Personalised animated bedtime stories — in mum&apos;s voice.
        </p>
      </div>

      {/* Stories */}
      <section>
        <h2 className="text-xl font-bold text-white mb-6">Recent Stories</h2>

        {isLoading && (
          <div className="flex items-center gap-3 text-white/50">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading stories...</span>
          </div>
        )}

        {isError && (
          <div className="flex items-center gap-3 text-red-400 bg-red-400/10 rounded-xl px-4 py-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">
              {error instanceof Error ? error.message : 'Failed to load stories'}
            </span>
          </div>
        )}

        {jobs && jobs.length === 0 && (
          <p className="text-white/40 text-sm">No stories yet. Go create one!</p>
        )}

        {jobs && jobs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <div
                key={job.job_id}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="text-white text-sm font-medium line-clamp-2 flex-1">
                    {job.script_text || 'Untitled Story'}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full shrink-0 font-medium ${
                      job.status === 'completed'
                        ? 'bg-green-500/20 text-green-400'
                        : job.status === 'failed'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <p className="text-white/30 text-xs mb-4">
                  {new Date(job.created_at).toLocaleDateString()}
                </p>

                {job.cloudfront_url && (
                  <a
                    href={`/player/${job.job_id}`}
                    aria-label={`Play story ${job.job_id}`}
                    className="flex items-center gap-2 text-amber-400 text-sm font-medium hover:text-amber-300 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Watch
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
