/**
 * GuidelineReminder - Agent 전환 시 지침 상기 시스템
 * Starian v4.4 핵심 컴포넌트
 */

class GuidelineReminder {
  constructor() {
    this.currentAgent = null;
    this.lastRemindTime = null;
    this.userPreferences = {
      enableReminders: true,
      reminderFrequency: 'normal', // minimal, normal, detailed
      complexTaskThreshold: 3 // 복잡도 3 이상에서 사전 알림
    };
    this.reminderHistory = [];
    this.guidelineChecklist = [
      'PROJECT_FOLDER_STRUCTURE',
      'EVIDENCE_FILE_MANDATORY',
      'GITHUB_SYNC_REQUIRED', 
      'REALTIME_DOCUMENTATION'
    ];
  }

  // 🔄 Agent 전환 감지 및 지침 상기
  async onAgentTransition(fromAgent, toAgent, taskContext) {
    console.log(`🔄 Agent 전환 감지: ${fromAgent} → ${toAgent}`);
    
    this.currentAgent = toAgent;
    
    // 사용자 피로도 체크 (1시간 내 3회 이상 리마인드 방지)
    if (this.isUserFatigued()) {
      console.log('🔇 사용자 피로도 고려하여 리마인드 스킵');
      return { skipped: true, reason: 'user_fatigue' };
    }
    
    // Agent별 맞춤 지침 상기
    const reminder = await this.generateAgentSpecificReminder(toAgent, taskContext);
    
    // 복잡한 작업인 경우 사전 알림 강화
    if (this.isComplexTask(taskContext)) {
      reminder.priority = 'HIGH';
      reminder.preTaskChecklist = await this.generatePreTaskChecklist(taskContext);
    }
    
    // 리마인드 실행
    const result = await this.displayReminder(reminder);
    
    // 히스토리 기록
    this.recordReminderHistory(fromAgent, toAgent, reminder, result);
    
    return result;
  }

  // 🎯 Agent별 맞춤 지침 생성
  async generateAgentSpecificReminder(agentType, taskContext) {
    const baseReminder = {
      timestamp: new Date().toISOString(),
      agentType: agentType,
      priority: 'NORMAL',
      guidelines: []
    };

    switch(agentType) {
      case 'Strategy Planning Agent':
        baseReminder.guidelines = [
          '📋 요구사항 분석 전 프로젝트 폴더 구조 확인',
          '🎯 분석 결과를 evidence/ 폴더에 즉시 기록',
          '📊 시장 조사 데이터는 실시간으로 문서화'
        ];
        break;

      case 'Product Design Agent':
        baseReminder.guidelines = [
          '🏗️ 설계 문서는 docs/ 폴더에 체계적으로 저장',
          '📐 아키텍처 다이어그램과 함께 증거 파일 생성',
          '🔄 설계 변경사항 즉시 Git 커밋'
        ];
        break;

      case 'Development Agent':
        baseReminder.guidelines = [
          '💻 모든 코드는 src/ 폴더에 체계적으로 구성',
          '📝 구현 완료 시 즉시 completion-proof.md 생성',
          '🔄 작업 단위별 Git 커밋 및 푸시 필수',
          '🧪 테스트 코드와 함께 품질 검증 수행'
        ];
        break;

      case 'User Testing Agent':
        baseReminder.guidelines = [
          '👥 테스트 결과는 evidence/ 폴더에 상세 기록',
          '📊 사용자 피드백 데이터 실시간 분석',
          '🔍 테스트 시나리오와 결과 매핑 문서화'
        ];
        break;

      case 'Growth Optimization Agent':
        baseReminder.guidelines = [
          '📈 최적화 전후 성능 지표 비교 분석',
          '🎯 개선사항 우선순위별 체계적 기록',
          '📊 ROI 분석 결과 즉시 문서화'
        ];
        break;

      default:
        baseReminder.guidelines = [
          '📁 표준 프로젝트 구조 준수 확인',
          '📋 모든 작업에 대한 증거 파일 생성',
          '🔄 변경사항 실시간 Git 동기화'
        ];
    }

    // 현재 프로젝트 상태 기반 추가 지침
    const contextualGuidelines = await this.generateContextualGuidelines(taskContext);
    baseReminder.guidelines.push(...contextualGuidelines);

    return baseReminder;
  }

  // 📋 복잡한 작업 사전 체크리스트 생성
  async generatePreTaskChecklist(taskContext) {
    return {
      preExecution: [
        '✅ 프로젝트 폴더 구조 완전성 확인',
        '✅ 이전 작업 증거 파일 존재 확인',
        '✅ Git 동기화 상태 점검',
        '✅ 작업 범위 및 완료 기준 명확화'
      ],
      duringExecution: [
        '⏱️ 30분마다 진행 상황 체크포인트 저장',
        '📝 주요 결정사항 실시간 기록',
        '🔄 중간 산출물 즉시 커밋'
      ],
      postExecution: [
        '📋 completion-proof.md 즉시 생성',
        '🔍 결과물 품질 검증',
        '🔄 최종 Git 푸시 및 동기화 확인',
        '📊 다음 작업으로의 연계 준비'
      ]
    };
  }

  // 🌐 컨텍스트 기반 추가 지침
  async generateContextualGuidelines(taskContext) {
    const guidelines = [];
    
    // Git 상태 기반 지침
    if (taskContext.gitStatus?.needsCommit) {
      guidelines.push('🚨 미커밋 변경사항 존재 - 작업 전 Git 정리 필요');
    }
    
    // 증거 파일 누락 체크
    const missingEvidence = this.checkMissingEvidence(taskContext);
    if (missingEvidence.length > 0) {
      guidelines.push(`📋 누락된 증거 파일 ${missingEvidence.length}개 - 우선 생성 권장`);
    }
    
    // 프로젝트 진행률 기반 지침
    const progress = this.calculateProgress(taskContext);
    if (progress > 50) {
      guidelines.push('🎯 프로젝트 중반부 - 품질 검증 및 리팩토링 고려');
    }
    
    return guidelines;
  }

  // 🎨 리마인드 표시 (사용자 경험 최적화)
  async displayReminder(reminder) {
    if (!this.userPreferences.enableReminders) {
      return { displayed: false, reason: 'user_disabled' };
    }

    // 표시 레벨 결정
    const displayLevel = this.determineDisplayLevel(reminder);
    
    let message = '';
    
    switch(displayLevel) {
      case 'MINIMAL':
        message = this.generateMinimalReminder(reminder);
        break;
      case 'NORMAL':
        message = this.generateNormalReminder(reminder);
        break;
      case 'DETAILED':
        message = this.generateDetailedReminder(reminder);
        break;
    }

    // 실제 표시 (콘솔 또는 UI 컴포넌트)
    console.log('\n' + '='.repeat(50));
    console.log('🎯 **Starian v4.4 지침 상기**');
    console.log('='.repeat(50));
    console.log(message);
    console.log('='.repeat(50) + '\n');

    this.lastRemindTime = new Date();
    
    return {
      displayed: true,
      level: displayLevel,
      timestamp: new Date().toISOString(),
      guidelines: reminder.guidelines
    };
  }

  // 📱 최소 리마인드 (피로도 최소화)
  generateMinimalReminder(reminder) {
    return `🤖 ${reminder.agentType} 활성화
🎯 핵심: 📁구조 → 📋증거파일 → 🔄Git동기화`;
  }

  // 📋 일반 리마인드
  generateNormalReminder(reminder) {
    let message = `🤖 **${reminder.agentType}** 활성화\n\n`;
    message += '🎯 **핵심 지침**:\n';
    
    reminder.guidelines.slice(0, 3).forEach((guideline, index) => {
      message += `   ${index + 1}. ${guideline}\n`;
    });
    
    if (reminder.priority === 'HIGH') {
      message += '\n🚨 **복잡한 작업 감지** - 사전 체크리스트 확인 권장';
    }
    
    return message;
  }

  // 📊 상세 리마인드
  generateDetailedReminder(reminder) {
    let message = `🤖 **${reminder.agentType}** 활성화\n\n`;
    
    message += '🎯 **핵심 지침**:\n';
    reminder.guidelines.forEach((guideline, index) => {
      message += `   ${index + 1}. ${guideline}\n`;
    });
    
    if (reminder.preTaskChecklist) {
      message += '\n📋 **사전 체크리스트**:\n';
      reminder.preTaskChecklist.preExecution.forEach(item => {
        message += `   ${item}\n`;
      });
    }
    
    message += '\n💡 **팁**: 각 단계별 증거 파일 생성으로 품질 보장';
    
    return message;
  }

  // 🔍 복잡한 작업 감지
  isComplexTask(taskContext) {
    const complexity = taskContext.currentTask?.complexity || 0;
    const dependencies = taskContext.currentTask?.dependencies?.length || 0;
    const estimatedTime = taskContext.currentTask?.estimatedTime || 0;
    
    return complexity >= this.userPreferences.complexTaskThreshold ||
           dependencies > 2 ||
           estimatedTime > 60; // 60분 이상
  }

  // 😴 사용자 피로도 체크
  isUserFatigued() {
    if (!this.lastRemindTime) return false;
    
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentReminders = this.reminderHistory.filter(
      r => new Date(r.timestamp) > oneHourAgo
    );
    
    return recentReminders.length >= 3;
  }

  // 📊 표시 레벨 결정
  determineDisplayLevel(reminder) {
    if (this.userPreferences.reminderFrequency === 'minimal') return 'MINIMAL';
    if (this.userPreferences.reminderFrequency === 'detailed') return 'DETAILED';
    
    // 복잡한 작업이나 높은 우선순위는 상세 표시
    if (reminder.priority === 'HIGH') return 'DETAILED';
    
    return 'NORMAL';
  }

  // 📝 리마인드 히스토리 기록
  recordReminderHistory(fromAgent, toAgent, reminder, result) {
    this.reminderHistory.push({
      timestamp: new Date().toISOString(),
      fromAgent: fromAgent,
      toAgent: toAgent,
      reminder: reminder,
      result: result,
      userResponse: 'acknowledged' // 실제로는 사용자 반응 추적
    });
    
    // 히스토리 크기 제한 (최근 50개)
    if (this.reminderHistory.length > 50) {
      this.reminderHistory = this.reminderHistory.slice(-50);
    }
  }

  // 🔍 누락된 증거 파일 체크
  checkMissingEvidence(taskContext) {
    const completedTasks = taskContext.completedTasks || [];
    return completedTasks.filter(task => 
      !task.evidence || task.evidence.length === 0
    );
  }

  // 📊 프로젝트 진행률 계산
  calculateProgress(taskContext) {
    const total = taskContext.totalTasks || 0;
    const completed = taskContext.completedTasks?.length || 0;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  // ⚙️ 사용자 설정 업데이트
  updateUserPreferences(newPreferences) {
    this.userPreferences = {
      ...this.userPreferences,
      ...newPreferences
    };
    
    console.log('✅ 리마인드 설정 업데이트:', this.userPreferences);
  }

  // 📊 리마인드 효과성 분석
  analyzeEffectiveness() {
    const recent = this.reminderHistory.slice(-10);
    
    return {
      totalReminders: this.reminderHistory.length,
      recentEffectiveness: recent.length > 0 ? 
        recent.filter(r => r.userResponse === 'acknowledged').length / recent.length : 0,
      avgRemindersPerHour: this.calculateReminderFrequency(),
      mostEffectiveLevel: this.findMostEffectiveLevel(),
      recommendations: this.generateEffectivenessRecommendations()
    };
  }

  // 📈 리마인드 빈도 계산
  calculateReminderFrequency() {
    if (this.reminderHistory.length < 2) return 0;
    
    const first = new Date(this.reminderHistory[0].timestamp);
    const last = new Date(this.reminderHistory[this.reminderHistory.length - 1].timestamp);
    const hours = (last - first) / (1000 * 60 * 60);
    
    return hours > 0 ? this.reminderHistory.length / hours : 0;
  }

  // 🎯 가장 효과적인 표시 레벨 찾기
  findMostEffectiveLevel() {
    const levelStats = { MINIMAL: 0, NORMAL: 0, DETAILED: 0 };
    
    this.reminderHistory.forEach(r => {
      if (r.userResponse === 'acknowledged') {
        levelStats[r.result.level]++;
      }
    });
    
    return Object.keys(levelStats).reduce((a, b) => 
      levelStats[a] > levelStats[b] ? a : b
    );
  }

  // 💡 효과성 개선 권장사항
  generateEffectivenessRecommendations() {
    const analysis = this.analyzeEffectiveness();
    const recommendations = [];
    
    if (analysis.recentEffectiveness < 0.7) {
      recommendations.push('리마인드 빈도를 줄여 사용자 피로도 감소');
    }
    
    if (analysis.avgRemindersPerHour > 2) {
      recommendations.push('리마인드 간격을 늘려 집중력 향상');
    }
    
    return recommendations;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GuidelineReminder;
}
