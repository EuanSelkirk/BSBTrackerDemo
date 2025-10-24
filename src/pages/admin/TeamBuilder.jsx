import { useState, useEffect } from "react";

function generateWeightCombos(min = 0.1, max = 1.0, step = 0.1) {
  const combos = [];
  for (let s = min; s <= max; s += step) {
    for (let g = min; g <= max - s; g += step) {
      const b = 1.0 - s - g;
      if (b >= min && b <= max) {
        combos.push({
          satisfaction: parseFloat(s.toFixed(2)),
          grade_balance: parseFloat(g.toFixed(2)),
          size_balance: parseFloat(b.toFixed(2)),
        });
      }
    }
  }
  return combos;
}

function variance(arr) {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.reduce((sum, val) => sum + (val - mean) ** 2, 0) / arr.length;
}

function scoreTeams(teams, userMap, weights) {
  let satisfaction = 0;
  const teamSizes = teams.map((team) => team.length);
  const avgGrades = [];
  const maxGrades = [];

  for (const team of teams) {
    let avgSum = 0;
    let maxSum = 0;
    for (const user of team) {
      const u = userMap[user];
      avgSum += u.avg_grade;
      maxSum += u.max_grade;

      for (const friend of u.want_with || []) {
        if (team.includes(friend)) satisfaction += 1;
      }
      for (const avoid of u.avoid_with || []) {
        if (team.includes(avoid)) satisfaction -= 1;
      }
    }
    avgGrades.push(avgSum / team.length);
    maxGrades.push(maxSum / team.length);
  }

  const avgVar = variance(avgGrades);
  const maxVar = variance(maxGrades);
  const sizeVar = variance(teamSizes);

  return (
    satisfaction * weights.satisfaction -
    (avgVar + maxVar) * weights.grade_balance -
    sizeVar * weights.size_balance
  );
}

function generateBalancedTeams(emails, teamCount) {
  const shuffled = [...emails].sort(() => Math.random() - 0.5);
  const teams = Array.from({ length: teamCount }, () => []);

  let i = 0;
  while (shuffled.length) {
    teams[i % teamCount].push(shuffled.pop());
    i++;
  }
  return teams;
}

function swapRandomUsers(teams) {
  const newTeams = teams.map((team) => [...team]);
  let t1, t2;
  do {
    t1 = Math.floor(Math.random() * newTeams.length);
    t2 = Math.floor(Math.random() * newTeams.length);
  } while (t1 === t2 || !newTeams[t1].length || !newTeams[t2].length);

  const i1 = Math.floor(Math.random() * newTeams[t1].length);
  const i2 = Math.floor(Math.random() * newTeams[t2].length);

  const temp = newTeams[t1][i1];
  newTeams[t1][i1] = newTeams[t2][i2];
  newTeams[t2][i2] = temp;

  return newTeams;
}

function optimizeTeams(userList, weights, maxIterations = 20000) {
  const userMap = Object.fromEntries(userList.map((u) => [u.email, u]));
  const userEmails = userList.map((u) => u.email);
  const teamCount = 4;

  let bestTeams = generateBalancedTeams(userEmails, teamCount);
  let bestScore = scoreTeams(bestTeams, userMap, weights);

  for (let i = 0; i < maxIterations; i++) {
    const candidate = swapRandomUsers(bestTeams);
    const candidateScore = scoreTeams(candidate, userMap, weights);
    if (candidateScore > bestScore) {
      bestTeams = candidate;
      bestScore = candidateScore;
    }
  }

  return { teams: bestTeams, score: bestScore, userMap };
}

export default function TeamBuilder() {
  const [score, setScore] = useState(0);
  const [teams, setTeams] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [rawUsers, setRawUsers] = useState([]);
  const [unsatisfied, setUnsatisfied] = useState([]);
  const [weights, setWeights] = useState({
    satisfaction: 1,
    grade_balance: 5,
    size_balance: 20,
  });
  const [range, setRange] = useState({ min: 0.1, max: 0.8, step: 0.1 });
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [topResults, setTopResults] = useState([]);

  useEffect(() => {
    if (rawUsers.length) {
      tryWeightSearch();
    }
  }, [rawUsers]);

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = JSON.parse(reader.result);
      setRawUsers(data);
    };
    reader.readAsText(file);
  }

  function resetOptimization() {
    setTeams([]);
    setScore(0);
    setUserMap({});
    setUnsatisfied([]);
    setTopResults([]);
    setProgress({ current: 0, total: 0 });
    setRawUsers([]);
  }

  async function tryWeightSearch() {
    if (!rawUsers.length) return;
    const combos = generateWeightCombos(range.min, range.max, range.step);
    let bestResults = [];
    setProgress({ current: 0, total: combos.length });

    for (let i = 0; i < combos.length; i++) {
      const w = combos[i];
      const result = optimizeTeams(rawUsers, w);
      bestResults.push({ ...result, weights: w });
      setProgress({ current: i + 1, total: combos.length });
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    bestResults.sort((a, b) => b.score - a.score);
    const best = bestResults[0];
    if (best) {
      setTeams(best.teams);
      setScore(best.score);
      setUserMap(best.userMap);
      setUnsatisfiedRelations(best.teams, best.userMap);
      setWeights(best.weights);
    }
    setTopResults(bestResults.slice(0, 3));
  }

  function teamStats(team) {
    const size = team.length;
    let avgSum = 0,
      maxSum = 0,
      satisfaction = 0;

    for (const user of team) {
      const u = userMap[user];
      avgSum += u.avg_grade;
      maxSum += u.max_grade;
      for (const friend of u.want_with || []) {
        if (team.includes(friend)) satisfaction += 1;
      }
      for (const avoid of u.avoid_with || []) {
        if (team.includes(avoid)) satisfaction -= 1;
      }
    }

    return {
      size,
      avg: (avgSum / size).toFixed(2),
      max: (maxSum / size).toFixed(2),
      satisfaction,
    };
  }

  function setUnsatisfiedRelations(teams, userMap) {
    const violations = [];
    const allUsers = teams.flat();

    for (const team of teams) {
      for (const user of team) {
        const u = userMap[user];
        for (const desired of u.want_with || []) {
          if (!team.includes(desired)) {
            violations.push(`${user} wanted to be with ${desired} but isn't.`);
          }
        }
        for (const avoid of u.avoid_with || []) {
          if (team.includes(avoid)) {
            violations.push(
              `${user} wanted to avoid ${avoid} but is with them.`
            );
          }
        }
      }
    }
    setUnsatisfied(violations);
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Team Optimizer</h2>
      <input type="file" accept=".json" onChange={handleFileUpload} />

      <div className="my-4 space-y-2">
        <label className="block">
          Weight Range Min:
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={range.min}
            onChange={(e) =>
              setRange((r) => ({ ...r, min: parseFloat(e.target.value) }))
            }
            className="w-full"
          />
          <span className="text-sm">{range.min.toFixed(2)}</span>
        </label>
        <label className="block">
          Weight Range Max:
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={range.max}
            onChange={(e) =>
              setRange((r) => ({ ...r, max: parseFloat(e.target.value) }))
            }
            className="w-full"
          />
          <span className="text-sm">{range.max.toFixed(2)}</span>
        </label>
        <label className="block">
          Weight Step:
          <input
            type="range"
            min="0.01"
            max="0.5"
            step="0.01"
            value={range.step}
            onChange={(e) =>
              setRange((r) => ({ ...r, step: parseFloat(e.target.value) }))
            }
            className="w-full"
          />
          <span className="text-sm">{range.step.toFixed(2)}</span>
        </label>
      </div>

      <div className="my-4">
        <button
          onClick={tryWeightSearch}
          className="bg-blue-600 text-white px-3 py-1 rounded mr-2"
        >
          Start Optimization
        </button>
        <button
          onClick={resetOptimization}
          className="bg-gray-500 text-white px-3 py-1 rounded"
        >
          Reset
        </button>
      </div>

      <p className="text-lg font-medium mt-4">
        Final Score: {score.toFixed(2)}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {teams.map((team, i) => {
          const stats = teamStats(team);
          return (
            <div key={i} className="border p-2 rounded shadow">
              <h3 className="font-semibold mb-1">Team {i + 1}</h3>
              <p className="text-sm">Members: {stats.size}</p>
              <p className="text-sm">Avg Grade: {stats.avg}</p>
              <p className="text-sm">Max Grade: {stats.max}</p>
              <p className="text-sm">Satisfaction: {stats.satisfaction}</p>
              <ul className="mt-2">
                {team.map((email) => (
                  <li key={email}>{email}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {unsatisfied.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">
            Unsatisfied Relationships
          </h3>
          <ul className="list-disc list-inside text-sm">
            {unsatisfied.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {topResults.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Top 3 Configurations</h3>
          <ul className="list-disc list-inside text-sm">
            {topResults.map((res, idx) => (
              <li key={idx}>
                Score: {res.score.toFixed(2)} — Weights: S=
                {res.weights.satisfaction}, G={res.weights.grade_balance}, B=
                {res.weights.size_balance}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="my-4">
        <div className="h-4 bg-gray-200 rounded">
          <div
            className="h-4 bg-blue-500 rounded"
            style={{ width: `${(progress.current / progress.total) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600">
          Checked {progress.current} / {progress.total} combinations
        </p>
      </div>
    </div>
  );
}
