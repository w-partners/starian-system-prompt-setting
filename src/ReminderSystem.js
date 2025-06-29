/**
 * ReminderSystem - Agent 전환 및 주기적 지침 상기 통합 시스템
 * Starian v4.4 핵심 컴포넌트
 */

const GuidelineReminder = require('./reminders/GuidelineReminder');
const PeriodicChecker = require('./scheduling/PeriodicChecker');
const fs = require('fs').promises;
const path = require('path');

class ReminderSystem {
  constructor() {
    this.guidelineReminder = new GuidelineReminder();
    this.periodicChecker = new PeriodicChecker();
    this.messageTemplates = null;
    this.isInitialized = false;
    this.currentSession = null;
    this.eventListeners = new Map();
    
    // 시스템 상태
    this.systemState = {
      agentTransitionActive: true,
      periodicCheckActive: false,
      lastAgentTransition: null,
      reminderCount: 0,
      suppressionActive: false
    };
  }

  // 🚀 시스템 초기화
  async initialize(sessionContext) {
    console.log('🚀 ReminderSystem v4.4 초기화 중...');
    
    try {
      // 메시지 템플릿 로드
      await this.loadMessageTemplates();
      
      // 의존성 설정
      this.setupDependencies();
      
      // 세션 컨텍스트 설정
      this.currentSession = sessionContext;
      
      // 이벤트 리스너 등록
      this.registerEventListeners();
      
      // 주기적 검증 시작
      this.startPeriodicChecking(sessionContext);
      
      this.isInitialized = true;
      console.log('✅ ReminderSystem 초기화 완료');
      
      return { success: true, message: 'ReminderSystem initialized' };
      
    } catch (error) {
      console.error('❌ ReminderSystem 초기화 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 📋 메시지 템플릿 로드
  async loadMessageTemplates() {
    try {
      const templatePath = path.join(__dirname, 'templates', 'reminder-messages.json');
      const templateData = await fs.readFile(templatePath, 'utf8');
      this.messageTemplates = JSON.parse(templateData);
      console.log('📋 메시지 템플릿 로드 완료');
    } catch (error) {
      console.warn('⚠️ 메시지 템플릿 로드 실패, 기본값 사용:', error.message);
      this.messageTemplates = this.getDefaultTemplates();
    }
  }

  // 🔧 의존성 설정
  setupDependencies() {
    // GuidelineReminder와 PeriodicChecker 간 의존성 설정은 
    // 실제 GuidelineTracker, ViolationLogger 인스턴스가 필요
    console.log('🔧 의존성 설정 완료');
  }

  // 📡 이벤트 리스너 등록
  registerEventListeners() {
    // Agent 전환 이벤트
    this.addEventListener('agentTransition', (data) => {
      this.handleAgentTransition(data.fromAgent, data.toAgent, data.context);
    });
    
    // 작업 시작 이벤트
    this.addEventListener('taskStart', (data) => {
      this.handleTaskStart(data.task, data.context);
    });
    
    // 위반 감지 이벤트
    this.addEventListener('violationDetected', (data) => {
      this.handleViolationDetected(data.violations, data.context);
    });
    
    console.log('📡 이벤트 리스너 등록 완료');
  }

  // 🔄 Agent 전환 처리
  async handleAgentTransition(fromAgent, toAgent, context) {
    if (!this.systemState.agentTransitionActive) return;
    
    console.log(`🔄 Agent 전환 처리: ${fromAgent} → ${toAgent}`);
    
    try {
      // 지침 상기 실행
      const reminderResult = await this.guidelineReminder.onAgentTransition(
        fromAgent, toAgent, context
      );
      
      // 시스템 상태 업데이트
      this.systemState.lastAgentTransition = {
        from: fromAgent,
        to: toAgent,
        timestamp: new Date().toISOString(),
        reminderShown: reminderResult.displayed || false
      };
      
      this.systemState.reminderCount++;
      
      // 이벤트 발생
      this.emitEvent('reminderDisplayed', {
        type: 'agentTransition',
        result: reminderResult,
        context: context
      });
      
      return reminderResult;
      
    } catch (error) {
      console.error('❌ Agent 전환 처리 실패:', error);
      return { error: error.message };
    }
  }

  // 🎯 작업 시작 처리
  async handleTaskStart(task, context) {
    console.log(`🎯 작업 시작 처리: ${task.name}`);
    
    try {
      // 복잡한 작업인지 확인
      const isComplex = this.guidelineReminder.isComplexTask({ currentTask: task });
      
      if (isComplex) {
        // 사전 체크리스트 표시
        const checklist = await this.guidelineReminder.generatePreTaskChecklist(context);
        
        const reminder = {
          type: 'preTaskReminder',
          priority: 'HIGH',
          task: task,
          checklist: checklist,
          timestamp: new Date().toISOString()
        };
        
        await this.displayTaskReminder(reminder);
        
        return { displayed: true, type: 'preTaskReminder' };
      }
      
      return { displayed: false, reason: 'task_not_complex' };
      
    } catch (error) {
      console.error('❌ 작업 시작 처리 실패:', error);
      return { error: error.message };
    }
  }

  // ⚠️ 위반 감지 처리
  async handleViolationDetected(violations, context) {
    console.log(`⚠️ 위반 감지 처리: ${violations.length}개`);
    
    try {
      for (const violation of violations) {
        const alertMessage = this.formatViolationAlert(violation);
        await this.displayViolationAlert(alertMessage);
      }
      
      return { processed: violations.length };
      
    } catch (error) {
      console.error('❌ 위반 감지 처리 실패:', error);
      return { error: error.message };
    }
  }

  // 🕐 주기적 검증 시작
  startPeriodicChecking(sessionContext) {
    if (this.systemState.periodicCheckActive) {
      console.log('⚠️ 주기적 검증이 이미 활성화됨');
      return false;
    }
    
    const success = this.periodicChecker.start(sessionContext);
    this.systemState.periodicCheckActive = success;
    
    if (success) {
      console.log('🕐 주기적 검증 시작됨 (30분 간격)');
    }
    
    return success;
  }

  // ⏹️ 주기적 검증 중지
  stopPeriodicChecking() {
    const success = this.periodicChecker.stop();
    this.systemState.periodicCheckActive = !success;
    
    if (success) {
      console.log('⏹️ 주기적 검증 중지됨');
    }
    
    return success;
  }

  // 🎨 작업 리마인더 표시
  async displayTaskReminder(reminder) {
    if (!this.messageTemplates) return;
    
    const template = this.messageTemplates.reminderTemplates.preTaskReminder.comprehensive;
    
    const message = this.formatTemplate(template.template, {
      preExecution: this.formatChecklist(reminder.checklist.preExecution),
      duringExecution: this.formatChecklist(reminder.checklist.duringExecution),
      postExecution: this.formatChecklist(reminder.checklist.postExecution)
    });
    
    console.log('\n' + '📋'.repeat(30));
    console.log('📋 **복잡한 작업 사전 체크리스트**');
    console.log('📋'.repeat(30));
    console.log(message);
    console.log('📋'.repeat(30) + '\n');
  }

  // 🚨 위반 알림 표시
  async displayViolationAlert(alertMessage) {
    console.log('\n' + '⚠️'.repeat(25));
    console.log('⚠️ **지침 위반 감지**');
    console.log('⚠️'.repeat(25));
    console.log(alertMessage);
    console.log('⚠️'.repeat(25) + '\n');
  }

  // 📝 위반 알림 포맷팅
  formatViolationAlert(violation) {
    if (!this.messageTemplates) return violation.description;
    
    const severityKey = violation.severity.toLowerCase();
    const template = this.messageTemplates.reminderTemplates.violationAlert[severityKey];
    
    if (!template) return violation.description;
    
    return this.formatTemplate(template.template, {
      violationType: violation.type,
      description: violation.description,
      recommendation: this.getRecommendationForViolation(violation),
      estimatedTime: '10-15분',
      urgentAction: '즉시 수정 필요'
    });
  }

  // 💡 위반별 권장사항
  getRecommendationForViolation(violation) {
    const recommendations = {
      'PROJECT_FOLDER_STRUCTURE': '필수 폴더(evidence, docs, src) 생성',
      'EVIDENCE_FILE_MANDATORY': 'completion-proof.md 파일 즉시 생성',
      'GITHUB_SYNC_REQUIRED': 'git add . && git commit && git push 실행',
      'REALTIME_DOCUMENTATION': 'README.md 및 .session-context.json 업데이트'
    };
    
    return recommendations[violation.type] || '시스템 지원팀 문의';
  }

  // 📋 체크리스트 포맷팅
  formatChecklist(items) {
    return items.map(item => `   ${item}`).join('\n');
  }

  // 🔧 템플릿 포맷팅
  formatTemplate(template, variables) {
    let formatted = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      formatted = formatted.replace(new RegExp(placeholder, 'g'), value);
    }
    
    return formatted;
  }

  // 📡 이벤트 등록
  addEventListener(eventType, callback) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType).push(callback);
  }

  // 📢 이벤트 발생
  emitEvent(eventType, data) {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`이벤트 리스너 오류 [${eventType}]:`, error);
      }
    });
  }

  // 🔧 사용자 설정 업데이트
  updateUserPreferences(preferences) {
    this.guidelineReminder.updateUserPreferences(preferences);
    console.log('✅ 사용자 설정 업데이트 완료');
  }

  // 📊 시스템 상태 조회
  getSystemStatus() {
    return {
      isInitialized: this.isInitialized,
      systemState: this.systemState,
      periodicChecker: this.periodicChecker.getCheckStatistics(),
      reminderEffectiveness: this.guidelineReminder.analyzeEffectiveness(),
      currentSession: this.currentSession?.sessionId || null
    };
  }

  // 🎯 Agent 전환 트리거 (외부 호출용)
  async triggerAgentTransition(fromAgent, toAgent, context = null) {
    const sessionContext = context || this.currentSession;
    return await this.handleAgentTransition(fromAgent, toAgent, sessionContext);
  }

  // 🚀 작업 시작 트리거 (외부 호출용)
  async triggerTaskStart(task, context = null) {
    const sessionContext = context || this.currentSession;
    return await this.handleTaskStart(task, sessionContext);
  }

  // ⚠️ 위반 감지 트리거 (외부 호출용)
  async triggerViolationAlert(violations, context = null) {
    const sessionContext = context || this.currentSession;
    return await this.handleViolationDetected(violations, sessionContext);
  }

  // 💤 시스템 일시 중지
  pauseSystem() {
    this.systemState.suppressionActive = true;
    this.systemState.agentTransitionActive = false;
    console.log('💤 ReminderSystem 일시 중지됨');
  }

  // 🔄 시스템 재시작
  resumeSystem() {
    this.systemState.suppressionActive = false;
    this.systemState.agentTransitionActive = true;
    console.log('🔄 ReminderSystem 재시작됨');
  }

  // 🧹 시스템 정리
  cleanup() {
    this.stopPeriodicChecking();
    this.eventListeners.clear();
    this.isInitialized = false;
    console.log('🧹 ReminderSystem 정리 완료');
  }

  // 📋 기본 템플릿 반환
  getDefaultTemplates() {
    return {
      reminderTemplates: {
        agentTransition: {
          minimal: {
            template: "🤖 {agentType} 활성화\n🎯 핵심: {coreGuidelines}",
            variables: ["agentType", "coreGuidelines"]
          },
          normal: {
            template: "🤖 **{agentType}** 활성화\n\n🎯 **핵심 지침**:\n{guidelines}\n\n{priorityMessage}",
            variables: ["agentType", "guidelines", "priorityMessage"]
          }
        },
        violationAlert: {
          low: {
            template: "💡 **개선 제안**\n{violationType}: {description}\n🔧 권장 조치: {recommendation}",
            variables: ["violationType", "description", "recommendation"]
          },
          medium: {
            template: "⚠️ **지침 위반 감지**\n{violationType}: {description}\n🔧 권장 조치: {recommendation}",
            variables: ["violationType", "description", "recommendation"]
          },
          high: {
            template: "🚨 **심각한 위반 감지**\n{violationType}: {description}\n🚨 즉시 조치 필요: {urgentAction}",
            variables: ["violationType", "description", "urgentAction"]
          }
        },
        preTaskReminder: {
          comprehensive: {
            template: "🎯 **복잡한 작업 감지**\n\n📋 **사전 체크리스트**:\n{preExecution}\n\n⏱️ **진행 중 주의사항**:\n{duringExecution}\n\n✅ **완료 후 필수사항**:\n{postExecution}",
            variables: ["preExecution", "duringExecution", "postExecution"]
          }
        }
      }
    };
  }

  // 📊 시스템 성능 리포트
  generatePerformanceReport() {
    return {
      timestamp: new Date().toISOString(),
      systemUptime: this.isInitialized ? 'Active' : 'Inactive',
      totalReminders: this.systemState.reminderCount,
      periodicChecks: this.periodicChecker.getCheckStatistics(),
      effectiveness: this.guidelineReminder.analyzeEffectiveness(),
      systemHealth: this.systemState,
      recommendations: this.generateSystemRecommendations()
    };
  }

  // 💡 시스템 개선 권장사항
  generateSystemRecommendations() {
    const recommendations = [];
    const effectiveness = this.guidelineReminder.analyzeEffectiveness();
    
    if (effectiveness.recentEffectiveness < 0.7) {
      recommendations.push({
        priority: 'HIGH',
        category: 'USER_EXPERIENCE',
        description: '리마인더 효과성이 낮습니다. 빈도 조정을 권장합니다.'
      });
    }
    
    if (this.systemState.reminderCount > 50) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'OPTIMIZATION',
        description: '리마인더 사용량이 높습니다. 자동화 증대를 고려하세요.'
      });
    }
    
    return recommendations;
  }
}

// 🚀 초기화 헬퍼 함수
async function initializeReminderSystem(sessionContext) {
  console.log('🌟 ReminderSystem v4.4 초기화 시작...');
  const system = new ReminderSystem();
  
  const result = await system.initialize(sessionContext);
  
  if (result.success) {
    console.log('✅ ReminderSystem v4.4 초기화 완료!');
    console.log('📊 시스템 상태:', system.getSystemStatus());
  } else {
    console.error('❌ ReminderSystem 초기화 실패:', result.error);
  }
  
  return system;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ReminderSystem, initializeReminderSystem };
}

// 사용 예시 (주석으로 제공)
/*
// 시스템 초기화
const reminderSystem = await initializeReminderSystem(sessionContext);

// Agent 전환 트리거
await reminderSystem.triggerAgentTransition(
  'Strategy Planning Agent', 
  'Development Agent', 
  sessionContext
);

// 복잡한 작업 시작 트리거
await reminderSystem.triggerTaskStart({
  name: '복잡한 아키텍처 설계',
  complexity: 4,
  estimatedTime: 90
}, sessionContext);

// 위반 감지 트리거
await reminderSystem.triggerViolationAlert([
  {
    type: 'EVIDENCE_FILE_MANDATORY',
    severity: 'MEDIUM',
    description: '증거 파일이 누락되었습니다'
  }
], sessionContext);

// 시스템 상태 확인
const status = reminderSystem.getSystemStatus();
console.log('시스템 상태:', status);

// 성능 리포트 생성
const report = reminderSystem.generatePerformanceReport();
console.log('성능 리포트:', report);
*/
