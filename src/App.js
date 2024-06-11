import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [date, setDate] = useState('');
  const [session, setSession] = useState('');
  const [env, setEnv] = useState('');
  const [data, setData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [environmentDetails, setEnvironmentDetails] = useState('No data available for the selected date, session, and environment.');
  const [testSummary, setTestSummary] = useState({ total: 0, passed: 0, failed: 0 });
  const [reportPath, setReportPath] = useState('');

  useEffect(() => {
    fetch('/data.json')
      .then(response => response.json())
      .then(data => setData(data.months));
  }, []);

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);

    const formattedDate = selectedDate.replace(/-/g, '_');
    const monthName = new Date(selectedDate).toLocaleString('default', { month: 'long' });

    if (data && data[monthName] && data[monthName][formattedDate]) {
      setSessions(Object.keys(data[monthName][formattedDate]));
    } else {
      setSessions([]);
    }
  };

  const handleSessionChange = (e) => {
    const selectedSession = e.target.value;
    setSession(selectedSession);

    const formattedDate = date.replace(/-/g, '_');
    const monthName = new Date(date).toLocaleString('default', { month: 'long' });

    if (data && data[monthName] && data[monthName][formattedDate] && data[monthName][formattedDate][selectedSession]) {
      const selectedData = data[monthName][formattedDate][selectedSession];
      setEnv(selectedData.system_environment.Environment);  // Directly set the environment
    } else {
      setEnv('');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formattedDate = date.replace(/-/g, '_');
    const monthName = new Date(date).toLocaleString('default', { month: 'long' });

    if (data && data[monthName] && data[monthName][formattedDate] && data[monthName][formattedDate][session]) {
      const envData = data[monthName][formattedDate][session].system_environment;
      const summaryData = data[monthName][formattedDate][session].test_summary;

      setEnvironmentDetails(`Environment: ${envData.Environment} | ${envData.OS} ${envData.OSVersion} | ${envData.Browser} ${envData.BrowserVersion}`);
      setTestSummary({
        total: summaryData.total,
        passed: summaryData.passed,
        failed: summaryData.failed
      });
      setReportPath(data[monthName][formattedDate][session].report_path);
    } else {
      setEnvironmentDetails('No data available for the selected date, session, and environment.');
      setTestSummary({ total: 0, passed: 0, failed: 0 });
      setReportPath('');
    }
  };

  const handleDownloadReport = () => {
    if (reportPath) {
      const link = document.createElement('a');
      link.href = reportPath;
      link.download = reportPath.split('/').pop();
      link.click();
    } else {
      alert('No report available to download.');
    }
  };

  return (
    <div className="container">
      <h1>Test Results</h1>
      <form onSubmit={handleSubmit} className='test-results'>
        <div className="form-group">
          <label htmlFor="date">Date:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={handleDateChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="session">Session:</label>
          <select
            id="session"
            value={session}
            onChange={handleSessionChange}
          >
            <option value="">Select Session</option>
            {sessions.map((sess, index) => (
              <option key={index} value={sess}>{sess}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="env">Env:</label>
          <input
            type="text"
            id="env"
            value={env}
            readOnly
          />
        </div>
        <div className='submit-btn'>
          <button type="submit">Submit</button>
        </div>
      </form>
      <div className="results">
        <div className="info">{environmentDetails}</div>
        <div className="info">Test Summary: Total - {testSummary.total} | Passed - {testSummary.passed} | Failed - {testSummary.failed}</div>
        <button className="download-report" onClick={handleDownloadReport}>Download Report</button>
      </div>
    </div>
  );
}

export default App;