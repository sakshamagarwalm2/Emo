const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ANDROID_DIR = path.join(__dirname, '..', 'android');
const WRAPPER_DIR = path.join(ANDROID_DIR, 'gradle', 'wrapper');

const GRADLEW_BAT_CONTENT = `@rem
@rem Copyright 2015 the original author or authors.
@rem
@rem Licensed under the Apache License, Version 2.0 (the "License");
@rem you may not use this file except in compliance with the License.
@rem You may obtain a copy of the License at
@rem
@rem      https://www.apache.org/licenses/LICENSE-2.0
@rem
@rem Unless required by applicable law or agreed to in writing, software
@rem distributed under the License is distributed on an "AS IS" BASIS,
@rem WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
@rem See the License for the specific language governing permissions and
@rem limitations under the License.
@rem

@if "%DEBUG%" == "" @echo off
@rem ##########################################################################
@rem
@rem  Gradle startup script for Windows
@rem
@rem ##########################################################################

@rem Set local scope for the variables with windows NT shell
if "%OS%"=="Windows_NT" setlocal

set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%

@rem Resolve any "." and ".." in APP_HOME to make it shorter.
for %%i in ("%APP_HOME%") do set APP_HOME=%%~fi

@rem Add default JVM options here. You can also use JAVA_OPTS and GRADLE_OPTS to pass JVM options to this script.
set DEFAULT_JVM_OPTS="-Xmx64m" "-Xms64m"

@rem Find java.exe
if defined JAVA_HOME goto findJavaFromJavaHome

set JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
if "%ERRORLEVEL%" == "0" goto execute

echo.
echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.

goto fail

:findJavaFromJavaHome
set JAVA_HOME=%JAVA_HOME:"=%
set JAVA_EXE=%JAVA_HOME%/bin/java.exe

if exist "%JAVA_EXE%" goto execute

echo.
echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.

goto fail

:execute
@rem Setup the command line

set CLASSPATH=%APP_HOME%\\gradle\\wrapper\\gradle-wrapper.jar


@rem Execute Gradle
"%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %GRADLE_OPTS% "-Dorg.gradle.appname=%APP_BASE_NAME%" -classpath "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %*

:fail
rem Set variable GRADLE_EXIT_CONSOLE if you need the _script_ return code instead of
rem the _cmd.exe /c_ return code!
if  not "%GRADLE_EXIT_CONSOLE%" == "" [System.Environment]::Exit(1)
exit /b 1

:mainEnd
if "%OS%"=="Windows_NT" endlocal
`;

function setupGradlew() {
  if (!fs.existsSync(WRAPPER_DIR)) {
    fs.mkdirSync(WRAPPER_DIR, { recursive: true });
  }

  // Write gradlew.bat
  const gradlewBatPath = path.join(ANDROID_DIR, 'gradlew.bat');
  fs.writeFileSync(gradlewBatPath, GRADLEW_BAT_CONTENT);
  console.log('[Gradlew Setup] Created gradlew.bat');

  // Download gradle-wrapper.jar if not present
  const wrapperJarPath = path.join(WRAPPER_DIR, 'gradle-wrapper.jar');
  if (!fs.existsSync(wrapperJarPath) || fs.statSync(wrapperJarPath).size === 0) {
    console.log('[Gradlew Setup] Downloading gradle-wrapper.jar via PowerShell...');
    const jarUrl = 'https://raw.githubusercontent.com/gradle/gradle/v8.6.0/gradle/wrapper/gradle-wrapper.jar';
    const downloadCmd = `powershell -Command "Invoke-WebRequest -Uri '${jarUrl}' -OutFile '${wrapperJarPath}'"`;
    execSync(downloadCmd, { stdio: 'inherit' });
    console.log('[Gradlew Setup] Downloaded gradle-wrapper.jar successfully!');
  }
}

setupGradlew();
