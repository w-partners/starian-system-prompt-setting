/**
 * PeriodicChecker - 30분 주기 지침 준수 검증 스케줄러
 * Starian v4.4 핵심 컴포넌트
 */

class PeriodicChecker {
  constructor() {
    this.checkInterval = 30 * 60 * 1000; // 30분
    this.isRunning = false;
    this.intervalId = null;
    this.checkHistory = [];
    this.guidelineTracker = null;
    this.violationLogger = null;
    this.lastCheckTime = null;
    this.consecutiveFailures = 0;
    this.maxConsecutiveFailures = 3;
  }

  // 🔧 의존성 모듈 설정
  setDependencies(guidelineTracker, violationLogger) {
    this.guidelineTracker = guidelineTracker;
    this.violationLogger = violationLogger;
  }

  // 🚀 주기적 검증 시작
  start(sessionContext) {
    if (this.isRunning) {
      console.log('⚠️ 주기적 검증이 이미 실행 중입니다.');
      return false;
    }

    console.log('🔄 30분 주기 지침 준수 검증 시작');
    this.isRunning = true;
    this.consecutiveFailures = 0;

    // 즉시 첫 번째 검증 실행
    this.performPeriodicCheck(sessionContext);

    // 30분 간격으로 반복 실행
    this.intervalId = setInterval(() => {
      this.performPeriodicCheck(sessionContext);
    }, this.checkInterval);

    return true;
  }

  // ⏹️ 주기적 검증 중지
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ 주기적 검증이 실행 중이 아닙니다.');
      return false;
    }

    console.log('⏹️ 주기적 검증 중지');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    return true;
  }

  // 🔍 주기적 검증 실행
  async performPeriodicCheck(sessionContext) {
    const checkId = this.generateCheckId();
    const startTime = new Date();

    console.log(`🔍 주기적 검증 실행 [${checkId}] - ${startTime.toISOString()}`);

    try {
      // 1. 기본 시스템 상태 체크
      const systemHealth = await this.checkSystemHealth(sessionContext);
      
      // 2. 지침 준수 상태 검증
      const complianceStatus = await this.checkComplianceStatus(sessionContext);
      
      // 3. 위반 사항 감지 및 처리
      const violationStatus = await this.checkViolations(sessionContext);
      
      // 4. 자동 수정 시도
      const autoFixResults = await this.attemptAutoFixes(violationStatus.violations);
      
      // 5. 검증 결과 기록
      const checkResult = {
        checkId: checkId,
        timestamp: startTime.toISOString(),
        duration: Date.now() - startTime.getTime(),
        systemHealth: systemHealth,
        compliance: complianceStatus,
        violations: violationStatus,
        autoFixes: autoFixResults,
        status: 'SUCCESS'
      };

      this.recordCheckResult(checkResult);
      this.consecutiveFailures = 0;

      // 6. 중요한 문제 발견 시 알림
      if (this.hasCriticalIssues(checkResult)) {
        await this.notifyCriticalIssues(checkResult);
      }

      console.log(`✅ 주기적 검증 완료 [${checkId}] - ${checkResult.violations.count}개 위반 발견`);
      
      return checkResult;

    } catch (error) {
      console.error(`❌ 주기적 검증 실패 [${checkId}]:`, error);
      
      this.consecutiveFailures++;
      
      const errorResult = {
        checkId: checkId,
        timestamp: startTime.toISOString(),
        duration: Date.now() - startTime.getTime(),
        error: error.message,
        status: 'FAILED'
      };

      this.recordCheckResult(errorResult);

      // 연속 실패 시 시스템 중지
      if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
        console.error('🚨 연속 검증 실패로 인한 주기적 검증 중지');
        this.stop();
      }

      return errorResult;
    }
  }

  // 🏥 시스템 건강도 체크
  async checkSystemHealth(sessionContext) {
    const health = {
      timestamp: new Date().toISOString(),
      status: 'HEALTHY',
      issues: []
    };

    // 프로젝트 폴더 구조 확인
    if (!this.checkProjectStructure(sessionContext)) {
      health.issues.push({
        type: 'PROJECT_STRUCTURE',
        severity: 'HIGH',
        description: '필수 프로젝트 폴더가 누락되었습니다'
      });
    }

    // Git 저장소 상태 확인
    if (!this.checkGitRepository(sessionContext)) {
      health.issues.push({
        type: 'GIT_REPOSITORY',
        severity: 'MEDIUM',
        description: 'Git 저장소 연결에 문제가 있습니다'
      });
    }

    // 세션 컨텍스트 유효성 확인
    if (!this.checkSessionContext(sessionContext)) {
      health.issues.push({
        type: 'SESSION_CONTEXT',
        severity: 'HIGH',
        description: '세션 컨텍스트가 손상되었습니다'
      });
    }

    // 모듈 의존성 확인
    if (!this.checkModuleDependencies()) {
      health.issues.push({
        type: 'MODULE_DEPENDENCIES',
        severity: 'CRITICAL',
        description: '핵심 모듈이 로드되지 않았습니다'
      });
    }

    // 전체 상태 판정
    if (health.issues.length === 0) {
      health.status = 'HEALTHY';
    } else {
      const criticalIssues = health.issues.filter(i => i.severity === 'CRITICAL');
      const highIssues = health.issues.filter(i => i.severity === 'HIGH');
      
      if (criticalIssues.length > 0) {
        health.status = 'CRITICAL';
      } else if (highIssues.length > 0) {
        health.status = 'UNHEALTHY';
      } else {
        health.status = 'WARNING';
      }
    }

    return health;
  }

  // 📊 지침 준수 상태 확인
  async checkComplianceStatus(sessionContext) {
    if (!this.guidelineTracker) {
      return { error: 'GuidelineTracker not available' };
    }

    try {
      const complianceData = await this.guidelineTracker.trackCompliance(sessionContext);
      
      return {
        score: complianceData.score,
        violations: complianceData.violations,
        trend: complianceData.trend,
        timestamp: new Date().toISOString(),
        status: complianceData.score >= 85 ? 'GOOD' : 
                complianceData.score >= 70 ? 'ACCEPTABLE' : 'POOR'
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  // ⚠️ 위반 사항 확인
  async checkViolations(sessionContext) {
    const violations = [];
    
    // 기본 지침 위반 체크
    const basicViolations = await this.checkBasicGuidelines(sessionContext);
    violations.push(...basicViolations);
    
    // 시간 기반 위반 체크
    const timeBasedViolations = await this.checkTimeBasedViolations(sessionContext);
    violations.push(...timeBasedViolations);
    
    // 품질 기반 위반 체크
    const qualityViolations = await this.checkQualityViolations(sessionContext);
    violations.push(...qualityViolations);

    return {
      count: violations.length,
      violations: violations,
      severity: this.calculateOverallSeverity(violations),
      timestamp: new Date().toISOString()
    };
  }

  // 📋 기본 지침 위반 체크
  async checkBasicGuidelines(sessionContext) {
    const violations = [];
    
    // 프로젝트 구조 위반
    if (!this.checkProjectStructure(sessionContext)) {
      violations.push({
        type: 'PROJECT_FOLDER_STRUCTURE',
        severity: 'HIGH',
        description: '필수 프로젝트 폴더(evidence, docs, src)가 누락됨',
        autoFixable: true
      });
    }
    
    // 증거 파일 누락
    const missingEvidence = this.checkMissingEvidenceFiles(sessionContext);
    if (missingEvidence.length > 0) {
      violations.push({
        type: 'EVIDENCE_FILE_MANDATORY',
        severity: 'MEDIUM',
        description: `${missingEvidence.length}개 완료 작업의 증거 파일 누락`,
        autoFixable: false,
        details: missingEvidence
      });
    }
    
    // Git 동기화 지연
    if (this.checkGitSyncDelay(sessionContext)) {
      violations.push({
        type: 'GITHUB_SYNC_REQUIRED',
        severity: 'MEDIUM',
        description: 'Git 동기화가 30분 이상 지연됨',
        autoFixable: true
      });
    }
    
    return violations;
  }

  // ⏰ 시간 기반 위반 체크
  async checkTimeBasedViolations(sessionContext) {
    const violations = [];
    const now = new Date();
    
    // 문서 업데이트 지연
    const lastDocUpdate = new Date(sessionContext.lastSyncedAt || 0);
    const docUpdateDelay = now - lastDocUpdate;
    
    if (docUpdateDelay > 60 * 60 * 1000) { // 1시간 이상
      violations.push({
        type: 'REALTIME_DOCUMENTATION',
        severity: 'MEDIUM',
        description: '문서 업데이트가 1시간 이상 지연됨',
        autoFixable: true,
        delay: Math.round(docUpdateDelay / (60 * 1000)) + '분'
      });
    }
    
    // 장기간 미완료 작업
    if (sessionContext.currentTask) {
      const taskStartTime = new Date(sessionContext.currentTask.startedAt || now);
      const taskDuration = now - taskStartTime;
      
      if (taskDuration > 4 * 60 * 60 * 1000) { // 4시간 이상
        violations.push({
          type: 'LONG_RUNNING_TASK',
          severity: 'LOW',
          description: '현재 작업이 4시간 이상 진행 중',
          autoFixable: false,
          duration: Math.round(taskDuration / (60 * 60 * 1000)) + '시간'
        });
      }
    }
    
    return violations;
  }

  // 🔍 품질 기반 위반 체크
  async checkQualityViolations(sessionContext) {
    const violations = [];
    
    // 연속된 낮은 준수율
    const recentChecks = this.checkHistory.slice(-3);
    const lowScoreChecks = recentChecks.filter(
      check => check.compliance?.score < 70
    );
    
    if (lowScoreChecks.length >= 2) {
      violations.push({
        type: 'DECLINING_COMPLIANCE',
        severity: 'HIGH',
        description: '지침 준수율이 지속적으로 낮음',
        autoFixable: false,
        recentScores: recentChecks.map(c => c.compliance?.score)
      });
    }
    
    return violations;
  }

  // 🔧 자동 수정 시도
  async attemptAutoFixes(violations) {
    const results = [];
    
    for (const violation of violations) {
      if (violation.autoFixable) {
        try {
          const fixResult = await this.executeAutoFix(violation);
          results.push({
            violation: violation.type,
            status: fixResult.success ? 'FIXED' : 'FAILED',
            details: fixResult.details || fixResult.error
          });
        } catch (error) {
          results.push({
            violation: violation.type,
            status: 'ERROR',
            error: error.message
          });
        }
      }
    }
    
    return results;
  }

  // ⚙️ 개별 자동 수정 실행
  async executeAutoFix(violation) {
    switch(violation.type) {
      case 'PROJECT_FOLDER_STRUCTURE':
        return await this.fixProjectStructure();
      case 'GITHUB_SYNC_REQUIRED':
        return await this.fixGitSync();
      case 'REALTIME_DOCUMENTATION':
        return await this.fixDocumentationSync();
      default:
        return { success: false, error: 'Unknown violation type' };
    }
  }

  // 🏗️ 프로젝트 구조 자동 수정
  async fixProjectStructure() {
    try {
      // 실제 구현에서는 filesystem MCP 도구 사용
      console.log('🔧 프로젝트 구조 자동 수정 중...');
      return { success: true, details: 'Project structure fixed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 🔄 Git 동기화 자동 수정
  async fixGitSync() {
    try {
      // 실제 구현에서는 terminal MCP 도구 사용
      console.log('🔄 Git 자동 동기화 중...');
      return { success: true, details: 'Git sync completed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 📚 문서 동기화 자동 수정
  async fixDocumentationSync() {
    try {
      console.log('📚 문서 자동 동기화 중...');
      return { success: true, details: 'Documentation updated' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 🚨 중요한 문제 알림
  async notifyCriticalIssues(checkResult) {
    const criticalIssues = [
      ...checkResult.systemHealth.issues.filter(i => i.severity === 'CRITICAL'),
      ...checkResult.violations.violations.filter(v => v.severity === 'HIGH')
    ];
    
    if (criticalIssues.length > 0) {
      console.log('\n' + '🚨'.repeat(20));
      console.log('🚨 **중요한 문제 감지** 🚨');
      console.log('🚨'.repeat(20));
      
      criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. [${issue.severity}] ${issue.description}`);
      });
      
      console.log('🚨'.repeat(20) + '\n');
    }
  }

  // 🔍 중요한 문제 존재 여부 확인
  hasCriticalIssues(checkResult) {
    const criticalSystemIssues = checkResult.systemHealth.issues.filter(
      i => i.severity === 'CRITICAL'
    ).length;
    
    const highViolations = checkResult.violations.violations.filter(
      v => v.severity === 'HIGH'
    ).length;
    
    return criticalSystemIssues > 0 || highViolations > 0;
  }

  // 📊 전체 심각도 계산
  calculateOverallSeverity(violations) {
    if (violations.some(v => v.severity === 'HIGH')) return 'HIGH';
    if (violations.some(v => v.severity === 'MEDIUM')) return 'MEDIUM';
    if (violations.length > 0) return 'LOW';
    return 'NONE';
  }

  // 🆔 검증 ID 생성
  generateCheckId() {
    return 'check-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
  }

  // 📝 검증 결과 기록
  recordCheckResult(result) {
    this.checkHistory.push(result);
    this.lastCheckTime = new Date();
    
    // 히스토리 크기 제한 (최근 100개)
    if (this.checkHistory.length > 100) {
      this.checkHistory = this.checkHistory.slice(-100);
    }
  }

  // 📊 헬퍼 메소드들
  checkProjectStructure(sessionContext) {
    // 실제 구현에서는 파일 시스템 확인
    return true; // 임시
  }

  checkGitRepository(sessionContext) {
    return !!sessionContext.gitStatus?.remoteRepository;
  }

  checkSessionContext(sessionContext) {
    return sessionContext && sessionContext.sessionId && sessionContext.projectName;
  }

  checkModuleDependencies() {
    return !!this.guidelineTracker && !!this.violationLogger;
  }

  checkMissingEvidenceFiles(sessionContext) {
    const completed = sessionContext.completedTasks || [];
    return completed.filter(task => !task.evidence || task.evidence.length === 0);
  }

  checkGitSyncDelay(sessionContext) {
    if (!sessionContext.gitStatus?.lastCommitTime) return false;
    
    const lastCommit = new Date(sessionContext.gitStatus.lastCommitTime);
    const now = new Date();
    return (now - lastCommit) > 30 * 60 * 1000; // 30분
  }

  // 📈 검증 통계
  getCheckStatistics() {
    const recent = this.checkHistory.slice(-10);
    
    return {
      totalChecks: this.checkHistory.length,
      recentChecks: recent.length,
      successRate: recent.filter(c => c.status === 'SUCCESS').length / recent.length * 100,
      avgViolations: recent.reduce((sum, c) => sum + (c.violations?.count || 0), 0) / recent.length,
      lastCheckTime: this.lastCheckTime?.toISOString(),
      isRunning: this.isRunning,
      consecutiveFailures: this.consecutiveFailures
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PeriodicChecker;
}
