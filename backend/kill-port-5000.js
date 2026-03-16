const { exec } = require('child_process');

exec('netstat -ano | findstr :5000', (error, stdout, stderr) => {
  if (stdout) {
    const lines = stdout.trim().split('\n');
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      
      if (pid && pid !== '0') {
        console.log(`Killing process ${pid} using port 5000...`);
        exec(`taskkill /F /PID ${pid}`, (killError, killStdout, killStderr) => {
          if (killError) {
            console.error(`Failed to kill process ${pid}:`, killError.message);
          } else {
            console.log(`Successfully killed process ${pid}`);
          }
        });
      }
    }
  } else {
    console.log('No process found using port 5000');
  }
});
