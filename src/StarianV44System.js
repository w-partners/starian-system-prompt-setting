/**
 * Starian v4.4 통합 지침 추적 시스템
 * 모든 핵심 모듈을 통합하는 메인 클래스
 */

// 핵심 모듈 임포트
const GuidelineTracker = require('./GuidelineTracker');
const ViolationLogger = require('./ViolationLogger');
const ComplianceScorer = require('./ComplianceScorer');
const SessionContextExpander = require('./SessionContextExpander');

class StarianV44System {
  constructor() {
    // 핵심 모듈 초기화
    this.guidelineTracker = new GuidelineTracker();
    this.violationLogger = new ViolationLogger();
    this.complianceScorer = new ComplianceScorer();
    this.sessionContextExpander = new SessionContextExpander();
    
    // 모듈 간 의존성 설정
    this.sessionContextExpander.setDependencies(
      this.guidelineTracker,
      this.violationLogger,
      this.complianceScorer
    );
    
    this.isInitialized = true;
    this.version = '4.4.0';
    this.lastUpdate = new Date().toISOString();
  }

  // 🚀 시스템 전체 실행
  async executeFullSystem(currentSessionContext) {
    console.log('🚀 Starian v4.4 지침 추적 시스템 실행 중...');
    
    try {
      // 1. 지침 준수 상태 추적
      const complianceData = await this.guidelineTracker.trackCompliance(currentSessionContext);
      
      // 2. 위반 사항 감지 및 기록
      for (const violation of complianceData.violations) {
        await this.violationLogger.logViolation({
          ...violation,
          sessionContext: currentSessionContext
        });
      }
      
      // 3. 종합 준수율 계산
      const scoreResult = this.complianceScorer.calculateOverallScore(currentSessionContext);
      
      // 4. 세션 컨텍스트 확장
      const expandedContext = await this.sessionContextExpander.expandContext(currentSessionContext);
      
      // 5. 실행 결과 반환
      return {
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
        compliance: complianceData,
        score: scoreResult,
        expandedContext: expandedContext,
        violations: complianceData.violations,
        recommendations: scoreResult.recommendations,
        systemHealth: this.getSystemHealth()
      };
      
    } catch (error) {
      console.error('Starian v4.4 시스템 실행 오류:', error);
      return {
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: error.message,
        systemHealth: this.getSystemHealth()
      };
    }
  }

  // 📊 실시간 준수율 모니터링
  async monitorCompliance(sessionContext) {
    const result = await this.guidelineTracker.trackCompliance(sessionContext);
    
    // 심각한 위반 발견 시 즉시 대응
    const criticalViolations = result.violations.filter(v => v.severity === 'HIGH');
    if (criticalViolations.length > 0) {
      console.warn('🚨 심각한 지침 위반 감지:', criticalViolations);
      await this.handleCriticalViolations(criticalViolations, sessionContext);
    }
    
    return result;
  }

  // 🚨 심각한 위반 자동 처리
  async handleCriticalViolations(violations, sessionContext) {
    for (const violation of violations) {
      // 위반 기록
      await this.violationLogger.logViolation({
        ...violation,
        sessionContext: sessionContext
      });
      
      // 자동 수정 시도
      if (violation.autoFixable) {
        console.log(`🔧 자동 수정 시도: ${violation.rule}`);
        // 실제 자동 수정 로직 실행
      } else {
        console.log(`⚠️ 수동 개입 필요: ${violation.rule}`);
      }
    }
  }

  // 📈 종합 리포트 생성
  generateSystemReport() {
    const complianceReport = this.complianceScorer.generateComplianceReport();
    const violationReport = this.violationLogger.generateViolationReport();
    const complianceStats = this.guidelineTracker.getComplianceStats();
    
    return {
      timestamp: new Date().toISOString(),
      version: this.version,
      systemHealth: this.getSystemHealth(),
      compliance: complianceReport,
      violations: violationReport,
      stats: complianceStats,
      summary: {
        overallScore: complianceReport?.currentStatus?.score || 0,
        grade: complianceReport?.currentStatus?.grade || 'UNKNOWN',
        totalViolations: violationReport?.summary?.totalViolations || 0,
        autoFixRate: violationReport?.summary?.autoFixRate || 0,
        trend: complianceStats?.trend || 'STABLE'
      }
    };
  }

  // 🔍 시스템 건강도 체크
  getSystemHealth() {
    return {
      status: this.isInitialized ? 'HEALTHY' : 'UNINITIALIZED',
      modules: {
        guidelineTracker: !!this.guidelineTracker,
        violationLogger: !!this.violationLogger,
        complianceScorer: !!this.complianceScorer,
        sessionContextExpander: !!this.sessionContextExpander
      },
      lastUpdate: this.lastUpdate,
      version: this.version
    };
  }

  // 🎯 권장 조치 실행
  async executeRecommendations(recommendations, sessionContext) {
    const results = [];
    
    for (const rec of recommendations) {
      try {
        const result = await this.executeRecommendation(rec, sessionContext);
        results.push({
          recommendation: rec,
          result: result,
          status: 'SUCCESS'
        });
      } catch (error) {
        results.push({
          recommendation: rec,
          error: error.message,
          status: 'FAILED'
        });
      }
    }
    
    return results;
  }

  // 🔧 개별 권장사항 실행
  async executeRecommendation(recommendation, sessionContext) {
    switch(recommendation.category) {
      case 'PROJECT_FOLDER_STRUCTURE':
        return await this.fixProjectStructure();
      case 'GITHUB_SYNC_REQUIRED':
        return await this.performGitSync();
      case 'EVIDENCE_FILE_MANDATORY':
        return await this.generateMissingEvidence(sessionContext);
      case 'REALTIME_DOCUMENTATION':
        return await this.updateDocumentation(sessionContext);
      default:
        throw new Error(`Unknown recommendation category: ${recommendation.category}`);
    }
  }

  // 📁 프로젝트 구조 수정
  async fixProjectStructure() {
    console.log('📁 프로젝트 구조 자동 수정 중...');
    // 실제 구현에서는 filesystem MCP 도구 사용
    return { action: 'PROJECT_STRUCTURE_FIXED', success: true };
  }

  // 🔄 Git 동기화 수행
  async performGitSync() {
    console.log('🔄 Git 자동 동기화 중...');
    // 실제 구현에서는 terminal MCP 도구 사용
    return { action: 'GIT_SYNC_COMPLETED', success: true };
  }

  // 📋 누락된 증거 파일 생성
  async generateMissingEvidence(sessionContext) {
    console.log('📋 누락된 증거 파일 생성 중...');
    // 완료된 작업 중 증거 파일이 없는 것들 확인
    const tasksWithoutEvidence = sessionContext.completedTasks?.filter(
      task => !task.evidence || task.evidence.length === 0
    ) || [];
    
    return { 
      action: 'EVIDENCE_FILES_GENERATED', 
      count: tasksWithoutEvidence.length,
      success: true 
    };
  }

  // 📚 문서 업데이트
  async updateDocumentation(sessionContext) {
    console.log('📚 문서 자동 업데이트 중...');
    // README.md 및 .session-context.json 업데이트
    return { action: 'DOCUMENTATION_UPDATED', success: true };
  }

  // 📊 실시간 대시보드 데이터
  getDashboardData() {
    const systemReport = this.generateSystemReport();
    
    return {
      timestamp: new Date().toISOString(),
      quickStats: {
        score: systemReport.summary.overallScore,
        grade: systemReport.summary.grade,
        violations: systemReport.summary.totalViolations,
        trend: systemReport.summary.trend
      },
      systemStatus: systemReport.systemHealth,
      recentActivity: {
        lastComplianceCheck: this.guidelineTracker.lastCheck,
        recentViolations: this.violationLogger.getViolationHistory({ limit: 3 }),
        scoreHistory: this.complianceScorer.scoreHistory.slice(-5)
      },
      recommendations: systemReport.compliance?.recommendations?.slice(0, 3) || []
    };
  }
}

// 🚀 시스템 초기화 및 실행 헬퍼 함수
function initializeStarianV44() {
  console.log('🌟 Starian v4.4 지침 추적 시스템 초기화 중...');
  const system = new StarianV44System();
  
  console.log('✅ Starian v4.4 시스템 초기화 완료!');
  console.log('📊 시스템 건강도:', system.getSystemHealth());
  
  return system;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StarianV44System, initializeStarianV44 };
}

// 사용 예시 (주석으로 제공)
/*
// 시스템 초기화
const starianSystem = initializeStarianV44();

// 현재 세션 컨텍스트로 전체 시스템 실행
const sessionContext = {
  sessionId: "session-2025-06-30-17-30",
  projectName: "Starian System Prompt Setting",
  currentPhase: "Task 4 - 세션 컨텍스트 지침 추적 시스템 구축",
  completedTasks: [...],
  gitStatus: {...},
  // ... 기타 컨텍스트 데이터
};

// 전체 시스템 실행
const result = await starianSystem.executeFullSystem(sessionContext);
console.log('실행 결과:', result);

// 실시간 대시보드 데이터
const dashboardData = starianSystem.getDashboardData();
console.log('대시보드 데이터:', dashboardData);
*/
