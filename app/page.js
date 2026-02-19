"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { activities, timeSlots } from "@/lib/activities";
import {
  MoonIcon,
  SunIcon,
  CloudIcon,
  StarIcon,
  CheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightOnRectangleIcon,
  ArrowPathIcon,
  XMarkIcon,
  ShareIcon
} from "@heroicons/react/24/outline";

const iconMap = {
  MoonIcon,
  SunIcon,
  CloudIcon,
  StarIcon
};

export default function Home() {
  const { data: session, status } = useSession();
  const [day, setDay] = useState(1);
  const [checked, setChecked] = useState({});
  const [loading, setLoading] = useState(false);
  const [allDaysData, setAllDaysData] = useState({});
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(1);

  const totalPoints = activities.reduce((sum, act) => sum + act.points, 0);
  const requiredActivities = activities.filter(act => act.required);

  useEffect(() => {
    if (session) {
      loadAllDaysData();
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      loadChecklist();
    }
  }, [session, day]);

  useEffect(() => {
    if (session && Object.keys(checked).length > 0) {
      const timer = setTimeout(() => {
        handleAutoSave();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [checked, session]);

  async function loadChecklist() {
    setLoading(true);
    const res = await fetch(`/api/checklist?day=${day}`);
    const data = await res.json();
    
    const checkedMap = {};
    (data.submissions || []).forEach(sub => {
      checkedMap[sub.id] = true;
    });
    setChecked(checkedMap);
    setLoading(false);
  }

  async function loadAllDaysData() {
    const res = await fetch('/api/checklist/all');
    const data = await res.json();
    
    const processedData = {};
    if (data.allDays) {
      Object.keys(data.allDays).forEach(day => {
        const dayChecked = {};
        data.allDays[day].forEach(sub => {
          dayChecked[sub.id] = true;
        });
        processedData[day] = dayChecked;
      });
    }
    
    setAllDaysData(processedData);
  }

  async function handleAutoSave() {
    const checkedActivities = activities
      .filter(act => checked[act.id])
      .map(act => ({ id: act.id, points: act.points }));

    await fetch("/api/checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day, checkedActivities }),
    });
    
    setAllDaysData(prev => ({ ...prev, [day]: checked }));
  }

  function getDayStatus(dayNum) {
    const dayData = allDaysData[dayNum] || {};
    const dayScore = activities
      .filter(act => dayData[act.id])
      .reduce((sum, act) => sum + act.points, 0);
    const percentage = Math.round((dayScore / totalPoints) * 100);
    
    const missedRequired = requiredActivities.filter(act => !dayData[act.id]);
    
    if (missedRequired.length > 0) {
      return { color: 'bg-red-500', percentage, missedRequired };
    } else if (percentage >= 70) {
      return { color: 'bg-green-500', percentage, missedRequired: [] };
    } else if (percentage >= 20) {
      return { color: 'bg-yellow-500', percentage, missedRequired: [] };
    } else {
      return { color: 'bg-red-500', percentage, missedRequired: [] };
    }
  }

  function handleShare(type) {
    const reportData = generateReportData(type);
    const userName = session.user.name || session.user.email.split('@')[0];
    const shareText = `🌙 ${userName}'s Ramadhan Progress\n\n${reportData.title}\n📊 Overall: ${reportData.overallPercentage}%\n✅ Completed Days: ${reportData.completedDays}\n\n${reportData.summary}\n\n#RamadhanChallenge2026`;
    
    if (navigator.share) {
      navigator.share({
        title: `${userName}'s ${reportData.title}`,
        text: shareText,
        url: window.location.href
      });
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, '_blank');
    }
    setShowShareSheet(false);
  }

  function generateReportData(type, startDay = 1, endDay = 30) {
    if (type === 'daily') {
      startDay = endDay = day;
    } else if (type === 'weekly') {
      startDay = (selectedWeek - 1) * 7 + 1;
      endDay = Math.min(selectedWeek * 7, 30);
    }
    
    let totalScore = 0;
    let totalPossible = 0;
    let completedDays = 0;
    let excellentDays = 0;
    let goodDays = 0;
    
    for (let d = startDay; d <= endDay; d++) {
      const dayData = allDaysData[d] || {};
      const dayScore = activities.filter(act => dayData[act.id]).reduce((sum, act) => sum + act.points, 0);
      const dayTotal = activities.reduce((sum, act) => sum + act.points, 0);
      const percentage = Math.round((dayScore / dayTotal) * 100);
      
      totalScore += dayScore;
      totalPossible += dayTotal;
      if (dayScore > 0) completedDays++;
      if (percentage >= 70) excellentDays++;
      else if (percentage >= 20) goodDays++;
    }
    
    const overallPercentage = Math.round((totalScore / totalPossible) * 100);
    const reportTitle = type === 'daily' ? `Day ${startDay} Report` : 
                       type === 'weekly' ? `Week ${Math.floor((startDay - 1) / 7) + 1} Report` : 
                       'Monthly Report';
    
    const summary = type === 'daily' 
      ? `📈 ${overallPercentage}% completion with ${totalScore}/${totalPossible} points`
      : `📈 ${excellentDays} excellent days, ${goodDays} good days out of ${endDay - startDay + 1} days`;
    
    return {
      title: reportTitle,
      overallPercentage,
      completedDays,
      summary
    };
  }


  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ArrowPathIcon className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }
  
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3 sm:p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">🌙</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Ramadhan Tracker</h1>
              <p className="text-sm sm:text-base text-gray-600">Track your spiritual journey this blessed month</p>
            </div>
            <button 
              onClick={() => signIn("google")} 
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white px-4 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <p className="text-xs text-gray-500 text-center mt-4">
              Secure authentication powered by Google
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentScore = activities
    .filter(act => checked[act.id])
    .reduce((sum, act) => sum + act.points, 0);
  
  const currentPercentage = Math.round((currentScore / totalPoints) * 100);
  const missedRequired = requiredActivities.filter(act => !checked[act.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-gray-900">Day {day}</h1>
                <p className="text-xs sm:text-sm text-gray-500">Ramadhan 1447</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setShowShareSheet(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white px-3 py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
                title="Share Progress"
              >
                <ShareIcon className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Share</span>
              </button>
              <div className="text-right">
                <div className="text-sm sm:text-lg font-semibold text-gray-900">{currentScore} pts</div>
                <div className="text-xs sm:text-sm text-gray-500">{currentPercentage}%</div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                <span className="hidden sm:inline">{session.user.email}</span>
                <button 
                  onClick={() => signOut()} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Day Selector */}
        <div className="mb-6 sm:mb-8">
          <select 
            value={day} 
            onChange={(e) => setDay(Number(e.target.value))}
            className="w-full sm:w-auto bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {[...Array(30)].map((_, i) => (
              <option key={i + 1} value={i + 1}>Day {i + 1}</option>
            ))}
          </select>
        </div>

        {/* Activities */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <ArrowPathIcon className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {timeSlots.map((slot) => {
              const IconComponent = iconMap[slot.icon] || StarIcon;
              const colorClasses = {
                indigo: 'text-indigo-600 bg-indigo-50',
                orange: 'text-orange-600 bg-orange-50',
                yellow: 'text-yellow-600 bg-yellow-50',
                blue: 'text-blue-600 bg-blue-50',
                emerald: 'text-emerald-600 bg-emerald-50',
                amber: 'text-amber-600 bg-amber-50',
                rose: 'text-rose-600 bg-rose-50',
                purple: 'text-purple-600 bg-purple-50',
                violet: 'text-violet-600 bg-violet-50'
              };
              
              return (
                <div key={slot.id} className="bg-white rounded-lg border border-gray-200">
                  <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 ${colorClasses[slot.color]}`}>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                      <div>
                        <h3 className="text-sm sm:text-base font-medium text-gray-900">{slot.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">{slot.time}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 sm:p-6">
                    <div className="space-y-2 sm:space-y-3">
                      {slot.activities.map((act) => (
                        <label key={act.id} className={`flex items-center gap-3 p-3 sm:p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          checked[act.id] 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        } ${act.required ? 'border-l-4 border-l-amber-400' : ''}`}>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            checked[act.id] 
                              ? 'bg-green-500 border-green-500' 
                              : 'border-gray-300'
                          }`}>
                            {checked[act.id] && (
                              <CheckIcon className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <input
                            type="checkbox"
                            checked={checked[act.id] || false}
                            onChange={(e) => setChecked({ ...checked, [act.id]: e.target.checked })}
                            className="sr-only"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm sm:text-base font-medium text-gray-900 break-words">
                              {act.name}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {act.required && (
                                <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded">
                                  Required
                                </span>
                              )}
                              <span className="text-xs sm:text-sm text-gray-500">{act.points} points</span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 30 Days Overview */}
        <div className="mt-8 sm:mt-12 pb-20 sm:pb-24">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Monthly Progress</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2 mb-4">
              {[...Array(30)].map((_, i) => {
                const dayNum = i + 1;
                const status = getDayStatus(dayNum);
                return (
                  <div key={dayNum} className="relative">
                    <button
                      className={`w-10 h-10 sm:w-10 sm:h-10 ${status.color} text-white rounded font-medium text-sm hover:scale-105 transition-transform ${
                        dayNum === day ? 'ring-2 ring-gray-400 ring-offset-2' : ''
                      }`}
                      onClick={() => setDay(dayNum)}
                    >
                      {dayNum}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>&lt;20% or Missing Required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>20-69%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>≥70%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareSheet && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" 
            onClick={() => setShowShareSheet(false)}
          >
            <div 
              className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Share Progress</h3>
                  <p className="text-sm text-gray-500 mt-1">Choose what to share</p>
                </div>
                <button 
                  onClick={() => setShowShareSheet(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleShare('daily')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors group"
                >
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Today's Progress</div>
                    <div className="text-sm text-gray-500">Day {day} • {Math.round((activities.filter(act => checked[act.id]).reduce((sum, act) => sum + act.points, 0) / totalPoints) * 100)}% Complete</div>
                  </div>
                  <ShareIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </button>
                
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <button
                    onClick={() => handleShare('weekly')}
                    className="w-full flex items-center justify-between hover:bg-gray-100 rounded-lg p-2 -m-2 transition-colors group"
                  >
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Weekly Progress</div>
                      <div className="text-sm text-gray-500">Week {selectedWeek} • Days {(selectedWeek - 1) * 7 + 1}-{Math.min(selectedWeek * 7, 30)}</div>
                    </div>
                    <ShareIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  </button>
                  <select 
                    value={selectedWeek} 
                    onChange={(e) => setSelectedWeek(Number(e.target.value))}
                    className="w-full mt-3 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {[1, 2, 3, 4, 5].map(week => (
                      <option key={week} value={week}>
                        Week {week} (Days {(week - 1) * 7 + 1}-{Math.min(week * 7, 30)})
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={() => handleShare('monthly')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors group"
                >
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Monthly Progress</div>
                    <div className="text-sm text-gray-500">Complete Ramadhan Journey</div>
                  </div>
                  <ShareIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom Status */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 sm:p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-gray-900">{currentPercentage}%</div>
            <div className="text-xs sm:text-sm text-gray-500">Complete</div>
          </div>
          <div className="text-center flex-1 px-2 sm:px-4">
            {missedRequired.length === 0 ? (
              <div className="flex items-center justify-center gap-1 sm:gap-2 text-green-600">
                <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-base font-medium">All required completed</span>
              </div>
            ) : (
              <div className="text-red-600">
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-base font-medium">Missing required</span>
                </div>
                <div className="text-xs sm:text-sm text-center break-words max-w-full overflow-hidden">
                  {missedRequired.length > 3 
                    ? `${missedRequired.slice(0, 3).map(act => act.name).join(', ')} +${missedRequired.length - 3} more`
                    : missedRequired.map(act => act.name).join(', ')
                  }
                </div>
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-gray-900">{currentScore}</div>
            <div className="text-xs sm:text-sm text-gray-500">Points</div>
          </div>
        </div>
      </div>
    </div>
  );
}
