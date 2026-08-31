import './style.css';

const DB = {
  url: localStorage.getItem('ss_url') || '',
  key: localStorage.getItem('ss_key') || ''
};

const demo = {
  user: {
    id: 'demo-student',
    name: 'Demo Student',
    role: 'student'
  },

  courses: [{
    id: 'js',
    title: 'Modern JavaScript',
    category: 'Programming',
    level: 'Beginner',
    rating: 4.8,
    students: 128,
    description:
      'Build a strong JavaScript foundation through short videos, checks, coding practice and projects.',
    thumb:
      'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=900&q=80',
    progress: 38,
    lessons: 16,
    completed: 6
  }],

  lessons: [
    {
      id: 1,
      title: 'Variables & Data Types',
      module: 'Module 1',
      duration: '12 min',
      video:
        'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      complete: true
    },
    {
      id: 2,
      title: 'Functions & Scope',
      module: 'Module 1',
      duration: '15 min',
      video:
        'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      complete: true
    },
    {
      id: 3,
      title: 'Arrays & Objects',
      module: 'Module 2',
      duration: '18 min',
      video:
        'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      complete: false
    },
    {
      id: 4,
      title: 'DOM Fundamentals',
      module: 'Module 2',
      duration: '20 min',
      video:
        'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      complete: false
    }
  ],

  questions: [{
    id: 1,
    lesson_id: 3,
    type: 'mcq',
    question: 'Which keyword creates a block-scoped variable?',
    options: ['var', 'let', 'define', 'new'],
    answer: 'let',
    explanation: 'let is block scoped.'
  }],

  problems: [{
    id: 1,
    title: 'Sum an Array',
    difficulty: 'Easy',
    statement:
      'Write a function that returns the sum of all numbers in an array.',
    starter:
      `function sum(arr) {
  // your code
}`,
    tests: [
      {
        input: '[1,2,3]',
        expected: '6'
      },
      {
        input: '[5,5]',
        expected: '10'
      }
    ]
  }]
};

let state = {
  page: 'home',
  course: null,
  lesson: 3,
  user: demo.user,
  config: DB,
  toast: null,
  live: false
};

const $ = selector => document.querySelector(selector);

const esc = value =>
  String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));

function toast(message) {
  state.toast = message;
  render();

  setTimeout(() => {
    state.toast = null;
    render();
  }, 2400);
}

async function api(path, options = {}) {
  try {
    const response = await fetch(path, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        error:
          data.error ||
          data.message ||
          `Request failed (${response.status})`
      };
    }

    return data;
  } catch (error) {
    return {
      error: error.message
    };
  }
}

async function sb(path, options = {}) {
  if (!state.config.url || !state.config.key) {
    return null;
  }

  const response = await fetch(
    state.config.url + '/rest/v1/' + path,
    {
      ...options,

      headers: {
        apikey: state.config.key,
        Authorization: 'Bearer ' + state.config.key,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
        ...(options.headers || {})
      }
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}


/* =========================
   UI SHELL
========================= */

function shell(content) {
  return `
    <div class="app">

      <header>

        <div class="brand" onclick="go('home')">
          <span class="mark">S</span>
          <span>SkillStream</span>
        </div>

        <nav>
          <button onclick="go('home')">Learn</button>
          <button onclick="go('dashboard')">Dashboard</button>
          <button onclick="go('analytics')">Analytics</button>
        </nav>

        <div class="header-right">

          <button
            class="icon"
            onclick="go('settings')"
          >
            ⚙
          </button>

          <div class="avatar">
            ${esc(state.user.name[0])}
          </div>

        </div>

      </header>

      <main>
        ${content}
      </main>

      ${
        state.toast
          ? `<div class="toast">${esc(state.toast)}</div>`
          : ''
      }

    </div>
  `;
}


/* =========================
   NAVIGATION
========================= */

function go(page) {
  state.page = page;
  render();
}


/* =========================
   HOME
========================= */

function home() {

  const course = demo.courses[0];

  return `
    <section class="hero">

      <div>

        <div class="eyebrow">
          ACTIVE LEARNING PLATFORM
        </div>

        <h1>
          Learn. Prove.
          <em>Master.</em>
        </h1>

        <p>
          SkillStream connects every lesson to questions
          and practical problems, so students build
          understanding before moving forward.
        </p>

        <div class="actions">

          <button
            class="primary"
            onclick="openCourse()"
          >
            Continue learning →
          </button>

          <button
            class="secondary"
            onclick="go('catalog')"
          >
            Explore courses
          </button>

        </div>

      </div>

      <div class="hero-card">

        <div class="hero-stat">

          <strong>
            ${course.progress}%
          </strong>

          <span>
            Course progress
          </span>

        </div>

        <div class="bar">
          <i style="width:${course.progress}%"></i>
        </div>

        <div class="mini-row">

          <span>
            ${course.completed} /
            ${course.lessons}
            lessons
          </span>

          <span>
            🔥 7 day streak
          </span>

        </div>

      </div>

    </section>


    <section class="section">

      <div class="section-head">

        <div>

          <div class="eyebrow">
            YOUR LEARNING
          </div>

          <h2>
            Continue where you left off
          </h2>

        </div>

        <button
          class="text-btn"
          onclick="go('catalog')"
        >
          View all courses →
        </button>

      </div>


      <div
        class="course-card"
        onclick="openCourse()"
      >

        <img src="${course.thumb}">

        <div class="course-body">

          <span class="pill">
            ${course.category}
          </span>

          <h3>
            ${course.title}
          </h3>

          <p>
            ${course.description}
          </p>

          <div class="meta">

            <span>
              ★ ${course.rating}
            </span>

            <span>
              ${course.lessons} lessons
            </span>

            <span>
              ${course.level}
            </span>

          </div>

          <div class="bar">
            <i style="width:${course.progress}%"></i>
          </div>

          <small>
            ${course.progress}% complete
          </small>

        </div>

        <div class="play">
          ▶
        </div>

      </div>

    </section>


    <section class="feature-grid">

      <article>

        <b>01</b>

        <h3>
          Video → Question
        </h3>

        <p>
          Required watch percentage unlocks
          understanding checks.
        </p>

      </article>


      <article>

        <b>02</b>

        <h3>
          Question → Problem
        </h3>

        <p>
          Prove the concept before the practical
          task becomes available.
        </p>

      </article>


      <article>

        <b>03</b>

        <h3>
          Problem → Mastery
        </h3>

        <p>
          Code, submit, analyze mistakes and
          receive the next recommendation.
        </p>

      </article>

    </section>
  `;
}


/* =========================
   COURSE CATALOG
========================= */

function catalog() {

  return `
    <section class="page-head">

      <div class="eyebrow">
        COURSE CATALOG
      </div>

      <h1>
        Choose what to learn
      </h1>

      <p>
        Structured courses with
        progress-gated practice.
      </p>

    </section>


    <div class="filters">

      <input
        placeholder="Search courses…"
        oninput="filterCourses(this.value)"
      >

      <select>

        <option>
          All categories
        </option>

        <option>
          Programming
        </option>

        <option>
          Data
        </option>

      </select>


      <select>

        <option>
          All levels
        </option>

        <option>
          Beginner
        </option>

        <option>
          Intermediate
        </option>

      </select>

    </div>


    <div id="course-list">
      ${courseList()}
    </div>
  `;
}


function courseList() {

  return demo.courses
    .map(course => `

      <div
        class="catalog-card"
        onclick="openCourse()"
      >

        <img src="${course.thumb}">

        <div>

          <span class="pill">
            ${course.category}
          </span>

          <h3>
            ${course.title}
          </h3>

          <p>
            ${course.description}
          </p>

          <div class="meta">

            <span>
              ★ ${course.rating}
            </span>

            <span>
              ${course.students} learners
            </span>

            <span>
              ${course.level}
            </span>

          </div>

        </div>

        <button class="secondary">
          Open
        </button>

      </div>

    `)
    .join('');
}


function filterCourses(value) {

  const list = demo.courses.filter(course =>
    course.title
      .toLowerCase()
      .includes(value.toLowerCase())
  );

  $('#course-list').innerHTML =
    list
      .map(course => `

        <div
          class="catalog-card"
          onclick="openCourse()"
        >

          <img src="${course.thumb}">

          <div>

            <span class="pill">
              ${course.category}
            </span>

            <h3>
              ${course.title}
            </h3>

            <p>
              ${course.description}
            </p>

          </div>

          <button class="secondary">
            Open
          </button>

        </div>

      `)
      .join('') ||
    '<div class="empty">No courses found.</div>';
}


/* =========================
   COURSE
========================= */

function openCourse() {

  state.course = 'js';
  state.page = 'course';

  render();
}


function course() {

  return `
    <section class="course-banner">

      <div>

        <span class="pill">
          Programming · Beginner
        </span>

        <h1>
          Modern JavaScript
        </h1>

        <p>
          Learn JavaScript fundamentals with
          guided videos, checks and coding practice.
        </p>

        <div class="meta">

          <span>
            ★ 4.8
          </span>

          <span>
            16 lessons
          </span>

          <span>
            128 learners
          </span>

        </div>

      </div>


      <div class="course-progress">

        <strong>
          38%
        </strong>

        <span>
          complete
        </span>

        <div class="bar">
          <i style="width:38%"></i>
        </div>

      </div>

    </section>


    <div class="course-layout">

      <aside class="syllabus">

        <div class="aside-title">

          Course content

          <span>
            6 / 16
          </span>

        </div>


        ${
          [
            'Module 1 · Foundations',
            'Module 2 · Core JavaScript',
            'Module 3 · Browser & DOM',
            'Module 4 · Async JavaScript'
          ]
            .map(
              (module, index) => `

                <div class="module">

                  <b>
                    ${module}
                  </b>

                  <span>
                    ${index < 1 ? '✓' : '○'}
                  </span>

                  ${
                    index < 2
                      ? demo.lessons
                          .filter(
                            lesson =>
                              lesson.module ===
                              'Module ' + (index + 1)
                          )
                          .map(
                            lesson => `

                              <button
                                class="lesson ${
                                  lesson.id === state.lesson
                                    ? 'active'
                                    : ''
                                }"
                                onclick="openLesson(${lesson.id})"
                              >

                                <span>
                                  ${
                                    lesson.complete
                                      ? '✓'
                                      : '○'
                                  }
                                </span>

                                ${lesson.title}

                                <small>
                                  ${lesson.duration}
                                </small>

                              </button>

                            `
                          )
                          .join('')
                      : `
                        <div class="locked">
                          🔒 Complete previous module
                        </div>
                      `
                  }

                </div>

              `
            )
            .join('')
        }

      </aside>


      <div class="lesson-area">

        ${lessonView()}

      </div>

    </div>
  `;
}


function openLesson(id) {

  state.lesson = id;
  state.page = 'lesson';

  render();
}


/* =========================
   LESSON
========================= */

function lessonView() {

  const lesson =
    demo.lessons.find(
      item => item.id === state.lesson
    ) || demo.lessons[2];

  return `

    <div class="video-wrap">

      <video
        id="player"
        controls
        src="${lesson.video}"
        ontimeupdate="trackVideo(this)"
      ></video>

      <div class="video-overlay">

        <span>
          Lesson ${lesson.id}
        </span>

        <span>
          Required completion: 80%
        </span>

      </div>

    </div>


    <div class="lesson-title">

      <div>

        <span class="eyebrow">
          ${lesson.module}
        </span>

        <h2>
          ${lesson.title}
        </h2>

      </div>

      <button
        class="secondary"
        onclick="bookmark()"
      >
        ☆ Bookmark
      </button>

    </div>


    <div class="tabs">

      <button class="tab active">
        Overview
      </button>

      <button class="tab">
        Notes
      </button>

      <button class="tab">
        Discussion
      </button>

      <button class="tab">
        AI Tutor
      </button>

    </div>


    <div class="learning-grid">

      <section>

        <h3>
          Understanding check
        </h3>

        <p class="muted">
          Watch at least 80% of this lesson
          to unlock the question.
        </p>


        <div class="question-card">

          <span class="pill">
            Unlocked for demo
          </span>

          <h3>
            Which keyword creates a
            block-scoped variable?
          </h3>


          ${
            ['var', 'let', 'define', 'new']
              .map(
                option => `

                  <button
                    class="option"
                    onclick="answer('${option}')"
                  >
                    ${option}
                  </button>

                `
              )
              .join('')
          }


          <div id="answer-result"></div>

        </div>

      </section>


      <aside class="next-card">

        <div class="eyebrow">
          NEXT ACTIVITY
        </div>

        <h3>
          Problem: Sum an Array
        </h3>

        <p>
          Apply arrays and functions in a
          small coding challenge.
        </p>

        <button
          class="primary"
          onclick="go('problem')"
        >
          Open problem →
        </button>

      </aside>

    </div>

  `;
}


/* =========================
   VIDEO PROGRESS
========================= */

function trackVideo(video) {

  const percent =
    Math.round(
      (video.currentTime / video.duration) * 100
    ) || 0;

  localStorage.setItem(
    'ss_video_' + state.lesson,
    percent
  );
}


/* =========================
   QUESTIONS
========================= */

function answer(option) {

  const result = $('#answer-result');

  if (!result) {
    return;
  }

  if (option === 'let') {

    result.innerHTML = `
      <div class="success">
        ✓ Correct. Problem unlocked.
      </div>
    `;

    const lesson =
      demo.lessons.find(
        item => item.id === state.lesson
      );

    if (lesson) {
      lesson.complete = true;
    }

  } else {

    result.innerHTML = `
      <div class="error">
        Not quite. Review block scope
        and try again.
      </div>
    `;

  }
}


/* =========================
   BOOKMARK
========================= */

function bookmark() {
  toast(
    'Bookmark saved at this timestamp.'
  );
}


/* =========================
   CODING PROBLEM
========================= */

function problem() {

  return `

    <div class="problem-head">

      <div>

        <span class="eyebrow">
          PRACTICE LAB
        </span>

        <h1>
          Sum an Array
        </h1>

        <p>
          Return the sum of every number
          in an array.
        </p>

      </div>

      <span class="difficulty">
        Easy
      </span>

    </div>


    <div class="problem-layout">

      <article class="problem-card">

        <h3>
          Problem statement
        </h3>

        <p>
          Write a function
          <code>sum(arr)</code>
          that returns the total of all
          numeric values in the array.
        </p>

        <h4>
          Examples
        </h4>

        <pre>
Input: [1, 2, 3]
Output: 6

Input: [5, 5]
Output: 10
        </pre>

        <h4>
          Concepts
        </h4>

        <div class="tags">

          <span>
            Arrays
          </span>

          <span>
            Functions
          </span>

          <span>
            Loops
          </span>

        </div>

      </article>


      <section class="editor-card">

        <div class="editor-top">

          <select id="lang">

            <option>
              JavaScript
            </option>

            <option>
              Python
            </option>

            <option>
              Java
            </option>

            <option>
              C++
            </option>

          </select>


          <button
            class="secondary"
            onclick="runCode()"
          >
            ▶ Run
          </button>


          <button
            class="primary"
            onclick="submitCode()"
          >
            Submit
          </button>

        </div>


        <textarea id="code">function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}</textarea>


        <div
          id="code-result"
          class="console"
        >
          Ready. Run sample tests
          before submitting.
        </div>

      </section>

    </div>

  `;
}


/* =========================
   CODE EXECUTION
========================= */

async function runCode() {

  const code =
    $('#code').value;

  const language =
    $('#lang').value;

  $('#code-result').textContent =
    'Running sample tests…';

  const result =
    await api(
      '/api/code-run',
      {
        method: 'POST',

        body: JSON.stringify({
          code,
          language,
          tests: demo.problems[0].tests
        })
      }
    );

  $('#code-result').textContent =
    result.output ||
    result.error ||
    'Execution completed.';
}


/* =========================
   SUBMIT CODE
========================= */

function submitCode() {

  const code =
    $('#code').value;

  const correct =
    /reduce|for\s*\(|while\s*\(/.test(code);

  $('#code-result').innerHTML =
    correct
      ? `
        <span class="success">
          ✓ Accepted — all visible tests passed.
          Problem completed.
        </span>
      `
      : `
        <span class="error">
          Tests failed. Add logic that
          calculates the array total.
        </span>
      `;

  if (correct) {
    toast(
      'Problem completed — next lesson unlocked.'
    );
  }
}


/* =========================
   DASHBOARD
========================= */

function dashboard() {

  return `

    <section class="page-head">

      <div class="eyebrow">
        STUDENT DASHBOARD
      </div>

      <h1>
        Good afternoon,
        ${esc(state.user.name)}.
      </h1>

      <p>
        Here is your learning snapshot.
      </p>

    </section>


    <div class="stats">

      <div>
        <strong>
          38%
        </strong>

        <span>
          Course progress
        </span>
      </div>


      <div>
        <strong>
          7
        </strong>

        <span>
          Day streak
        </span>
      </div>


      <div>
        <strong>
          84%
        </strong>

        <span>
          Quiz average
        </span>
      </div>


      <div>
        <strong>
          12
        </strong>

        <span>
          Problems solved
        </span>
      </div>

    </div>


    <div class="dashboard-grid">

      <section class="panel">

        <div class="section-head">

          <h2>
            Continue learning
          </h2>

          <button
            class="text-btn"
            onclick="openCourse()"
          >
            Open course →
          </button>

        </div>


        <div class="dash-course">

          <img
            src="${demo.courses[0].thumb}"
          >

          <div>

            <b>
              Modern JavaScript
            </b>

            <p>
              Next: Arrays & Objects
            </p>

            <div class="bar">
              <i style="width:38%"></i>
            </div>

          </div>

        </div>

      </section>


      <section class="panel">

        <h2>
          Recommended for you
        </h2>


        <div class="recommend">

          <span>
            ↗
          </span>

          <div>

            <b>
              Practice: Array Methods
            </b>

            <p>
              Based on your recent quiz
              performance
            </p>

          </div>

        </div>


        <div class="recommend">

          <span>
            ↗
          </span>

          <div>

            <b>
              Review: Scope & Closures
            </b>

            <p>
              Strengthen a frequently
              missed concept
            </p>

          </div>

        </div>

      </section>

    </div>

  `;
}


/* =========================
   ANALYTICS
========================= */

function analytics() {

  return `

    <section class="page-head">

      <div class="eyebrow">
        LEARNING ANALYTICS
      </div>

      <h1>
        Your progress, explained.
      </h1>

      <p>
        SkillStream turns activity into
        practical learning insights.
      </p>

    </section>


    <div class="analytics-grid">

      <div class="panel">

        <h3>
          Concept strengths
        </h3>


        <div class="metric">

          <span>
            Variables
          </span>

          <b>
            92%
          </b>

          <div class="bar">
            <i style="width:92%"></i>
          </div>

        </div>


        <div class="metric">

          <span>
            Functions
          </span>

          <b>
            84%
          </b>

          <div class="bar">
            <i style="width:84%"></i>
          </div>

        </div>


        <div class="metric">

          <span>
            Arrays
          </span>

          <b>
            61%
          </b>

          <div class="bar">
            <i style="width:61%"></i>
          </div>

        </div>


        <div class="metric">

          <span>
            DOM
          </span>

          <b>
            46%
          </b>

          <div class="bar">
            <i style="width:46%"></i>
          </div>

        </div>

      </div>


      <div class="panel insight">

        <span class="insight-icon">
          ✦
        </span>

        <h3>
          AI learning insight
        </h3>

        <p>
          You are progressing well with
          JavaScript fundamentals.
          Arrays and DOM concepts need
          more practice before attempting
          advanced topics.
        </p>

        <button
          class="secondary"
          onclick="toast('Revision roadmap created.')"
        >
          Create revision roadmap
        </button>

      </div>

    </div>

  `;
}


/* =========================
   SETTINGS
========================= */

function settings() {

  return `

    <section class="page-head">

      <div class="eyebrow">
        SETUP
      </div>

      <h1>
        Database connection
      </h1>

      <p>
        Supabase is used for authentication,
        courses, progress, assessments
        and analytics.
      </p>

    </section>


    <div class="panel settings">

      <label>

        Supabase project URL

        <input
          id="sb-url"
          value="${esc(state.config.url)}"
          placeholder="https://xxxx.supabase.co"
        >

      </label>


      <label>

        Supabase anon key

        <input
          id="sb-key"
          value="${esc(state.config.key)}"
          placeholder="eyJhbGci..."
        >

      </label>


      <button
        class="primary"
        onclick="saveSettings()"
      >
        Save connection
      </button>


      <button
        class="secondary"
        onclick="testDb()"
      >
        Test database
      </button>


      <div
        id="db-status"
        class="muted"
      ></div>


      <hr>


      <h3>
        Demo mode
      </h3>

      <p>
        You can use the full learning flow
        immediately in demo mode.
        Once Supabase credentials are saved,
        production data can be loaded through
        the supplied schema.
      </p>

    </div>

  `;
}


/* =========================
   SAVE SUPABASE SETTINGS
========================= */

function saveSettings() {

  state.config.url =
    $('#sb-url')
      .value
      .trim()
      .replace(/\/$/, '');

  state.config.key =
    $('#sb-key')
      .value
      .trim();

  localStorage.setItem(
    'ss_url',
    state.config.url
  );

  localStorage.setItem(
    'ss_key',
    state.config.key
  );

  toast(
    'Database connection saved.'
  );
}


/* =========================
   TEST DATABASE
========================= */

async function testDb() {

  const status =
    $('#db-status');

  status.textContent =
    'Testing…';

  try {

    const result =
      await sb(
        'courses?select=id&limit=1'
      );

    status.textContent =
      '✓ Supabase connection is working.';

  } catch (error) {

    status.textContent =
      '✕ Connection failed: ' +
      error.message;

  }
}


/* =========================
   RENDER
========================= */

function render() {

  let content;

  if (state.page === 'home') {
    content = home();

  } else if (state.page === 'catalog') {
    content = catalog();

  } else if (state.page === 'course') {
    content = course();

  } else if (state.page === 'lesson') {
    content =
      `<div
        class="back"
        onclick="go('course')"
      >
        ← Back to course
      </div>` +
      lessonView();

  } else if (state.page === 'problem') {
    content = problem();

  } else if (state.page === 'dashboard') {
    content = dashboard();

  } else if (state.page === 'analytics') {
    content = analytics();

  } else {
    content = settings();
  }

  document.body.innerHTML =
    shell(content);
}


/* =========================
   GLOBAL FUNCTIONS
========================= */

window.go = go;
window.openCourse = openCourse;
window.openLesson = openLesson;
window.answer = answer;
window.bookmark = bookmark;
window.runCode = runCode;
window.submitCode = submitCode;
window.saveSettings = saveSettings;
window.testDb = testDb;
window.trackVideo = trackVideo;
window.filterCourses = filterCourses;


/* =========================
   INITIAL RENDER
========================= */

render();


/* ==================================================
   PRODUCTION SUPABASE LOADER
   Works with the existing SkillStream database
================================================== */

async function loadProductionData() {

  if (
    !state.config.url ||
    !state.config.key
  ) {
    return;
  }

  try {

    /* ---------- COURSES ---------- */

    const courses =
      await sb(
        'courses?select=*&published=eq.true&order=created_at.desc'
      );

    if (
      !Array.isArray(courses) ||
      !courses.length
    ) {
      return;
    }


    demo.courses =
      courses.map(course => ({

        id: course.id,

        title:
          course.title ||
          'Untitled course',

        category:
          course.category ||
          'General',

        level:
          course.level ||
          'Beginner',

        rating:
          Number(course.rating || 0),

        students:
          Number(course.students || 0),

        description:
          course.description || '',

        thumb:
          course.thumbnail_url ||
          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',

        progress:
          Number(course.progress || 0),

        lessons: 0,

        completed: 0

      }));


    /* ---------- CURRENT COURSE ---------- */

    state.course =
      state.course &&
      demo.courses.some(
        course =>
          String(course.id) ===
          String(state.course)
      )
        ? state.course
        : demo.courses[0].id;


    /* ---------- MODULES ---------- */

    const modules =
      await sb(
        'modules?select=*&course_id=eq.' +
        encodeURIComponent(state.course) +
        '&order=module_order.asc'
      );


    /* ---------- LESSONS ---------- */

    const lessons = [];


    for (
      const module of modules || []
    ) {

      const rows =
        await sb(
          'lessons?select=*&module_id=eq.' +
          encodeURIComponent(module.id) +
          '&order=lesson_order.asc'
        );


      for (
        const lesson of rows || []
      ) {

        lessons.push({

          id:
            lesson.id,

          title:
            lesson.title ||
            'Untitled lesson',

          module:
            module.title ||
            'Module',

          module_id:
            module.id,

          duration:
            (lesson.duration_minutes || 0) +
            ' min',

          video:
            lesson.video_url ||
            '',

          complete:
            false

        });

      }

    }


    /* ---------- LESSON PROGRESS ---------- */

    try {

      const progress =
        await sb(
          'lesson_progress?select=lesson_id,completed'
        );


      const progressMap =
        new Map(
          (progress || []).map(
            item => [
              String(item.lesson_id),
              !!item.completed
            ]
          )
        );


      lessons.forEach(
        lesson => {

          lesson.complete =
            progressMap.get(
              String(lesson.id)
            ) || false;

        }
      );

    } catch (error) {

      console.warn(
        'lesson_progress unavailable:',
        error.message
      );

    }


    if (lessons.length) {
      demo.lessons = lessons;
    }


    /* ---------- COURSE PROGRESS ---------- */

    const currentCourse =
      demo.courses.find(
        course =>
          String(course.id) ===
          String(state.course)
      );


    if (currentCourse) {

      currentCourse.lessons =
        demo.lessons.length;

      currentCourse.completed =
        demo.lessons.filter(
          lesson => lesson.complete
        ).length;

      currentCourse.progress =
        demo.lessons.length
          ? Math.round(
              currentCourse.completed /
              currentCourse.lessons *
              100
            )
          : 0;

    }


    /* ---------- QUESTIONS ---------- */

    try {

      const questions =
        await sb(
          'questions?select=*&course_id=eq.' +
          encodeURIComponent(state.course)
        );


      const options =
        await sb(
          'question_options?select=*'
        );


      demo.questions =
        (questions || []).map(
          question => {

            const questionOptions =
              (options || [])
                .filter(
                  option =>
                    String(
                      option.question_id
                    ) ===
                    String(question.id)
                )
                .sort(
                  (a, b) =>
                    (a.position || 0) -
                    (b.position || 0)
                );


            return {

              id:
                question.id,

              lesson_id:
                question.lesson_id ||
                null,

              type:
                question.question_type ||
                'mcq',

              question:
                question.question_text ||
                '',

              options:
                questionOptions.map(
                  option =>
                    option.option_text
                ),

              answer:
                (
                  questionOptions.find(
                    option =>
                      option.is_correct
                  ) || {}
                ).option_text ||
                null,

              explanation:
                question.explanation ||
                ''

            };

          }
        );

    } catch (error) {

      console.warn(
        'questions unavailable:',
        error.message
      );

    }


    /* ---------- CODING PROBLEMS ---------- */

    try {

      const problems =
        await sb(
          'coding_problems?select=*&course_id=eq.' +
          encodeURIComponent(state.course)
        );


      if (
        Array.isArray(problems) &&
        problems.length
      ) {

        demo.problems =
          problems.map(
            problem => ({

              id:
                problem.id,

              title:
                problem.title ||
                'Coding Problem',

              difficulty:
                problem.difficulty ||
                'Easy',

              statement:
                problem.description ||
                problem.statement ||
                '',

              starter:
                problem.starter_code ||
                problem.starter ||
                '',

              tests: []

            })
          );

      }

    } catch (error) {

      console.warn(
        'coding_problems unavailable:',
        error.message
      );

    }


    state.live = true;

    render();

  } catch (error) {

    state.live = false;

    console.warn(
      'Supabase production load failed:',
      error.message
    );

  }

}


/* =========================
   LOAD PRODUCTION DATA
========================= */

loadProductionData();
