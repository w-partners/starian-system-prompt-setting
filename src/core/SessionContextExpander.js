/**
 * SessionContextExpander - .session-context.json 동적 확장 모듈
 * Starian v4.4 핵심 컴포넌트
 */

class SessionContextExpander {
  constructor() {
    this.guidelineTracker = null;
    this.violationLogger = null;
    this.complianceScorer = null;
  }

  // 🔧 의존성 모듈 설정
  setDependencies(guidelineTracker, violationLogger, complianceScorer) {
    this.guidelineTracker = guidelineTracker;
    this.violationLogger = violationLogger;
    this.complianceScorer = complianceScorer;
  }

  // 📋 세션 컨텍스트 확장
  async expandContext(currentContext) {
    const expandedContext = {
      ...currentContext,
      guidelineCompliance: await this.generateEnhancedCompliance(currentContext),
      systemMetrics: await this.generateSystemMetrics(currentContext),
      aiAssistance: await this.generateAIAssistanceData(currentContext)
    };

    return expandedContext;
  }

  // 🎯 강화된 지침 준수 데이터 생성
  async generateEnhancedCompliance(currentContext) {
    const baseCompliance = currentContext.guidelineCompliance || {};
    
    // GuidelineTracker에서 실시간 준수 데이터 가져오기
    const complianceData = this.guidelineTracker ? 
      await this.guidelineTracker.trackCompliance(currentContext) : null;
    
    // ViolationLogger에서 위반 기록 가져오기
    const violationReport = this.violationLogger ? 
      this.violationLogger.generateViolationReport() : null;
    
    // ComplianceScorer에서 점수 계산
    const scoreData = this.complianceScorer ? 
      this.complianceScorer.calculateOverallScore(currentContext) : null;

    return {
      ...baseCompliance,
      lastCheck: new Date().toISOString(),
      overallScore: scoreData?.overallScore || baseCompliance.overallScore || 0,
      grade: scoreData?.grade || 'UNKNOWN',
      
      // 📊 상세 메트릭스
      detailedMetrics: {
        categoryScores: scoreData?.categoryScores || {},
        scoreBreakdown: scoreData?.breakdown || {},
        complianceHistory: this.guidelineTracker?.complianceHistory || [],
        trend: scoreData?.trend || 'STABLE'
      },
      
      // ⚠️ 위반 패턴 분석
      violationPatterns: {
        summary: violationReport?.summary || {},
        byType: violationReport?.byType || {},
        bySeverity: violationReport?.bySeverity || {},
        recentViolations: violationReport?.recentViolations || [],
        recurringIssues: violationReport?.summary?.recurringIssues || 0
      },
      
      // 📈 개선 권장사항
      recommendations: [
        ...(scoreData?.recommendations || []),
        ...(violationReport?.recommendations || [])
      ].slice(0, 5), // 상위 5개 권장사항
      
      // 🔄 활성 프로토콜 상태
      activeProtocols: [
        ...baseCompliance.activeProtocols || [],
        'GuidelineTracker',
        'ViolationLogger', 
        'ComplianceScorer'
      ],
      
      // 📊 준수율 통계
      complianceStats: this.guidelineTracker?.getComplianceStats() || null,
      
      // ⏰ 다음 권장 조치
      nextRecommendedActions: await this.generateNextActions(currentContext, scoreData)
    };
  }

  // 📊 시스템 메트릭스 생성
  async generateSystemMetrics(currentContext) {
    return {
      sessionInfo: {
        sessionId: currentContext.sessionId,
        startTime: currentContext.sessionStartTime || new Date().toISOString(),
        duration: this.calculateSessionDuration(currentContext),
        projectName: currentContext.projectName,
        currentPhase: currentContext.currentPhase
      },
      
      taskMetrics: {
        totalTasks: this.getTotalTasks(currentContext),
        completedTasks: currentContext.completedTasks?.length || 0,
        inProgressTasks: this.getInProgressTasks(currentContext),
        pendingTasks: this.getPendingTasks(currentContext),
        progressPercentage: this.calculateProgressPercentage(currentContext)
      },
      
      fileSystemMetrics: {
        evidenceFiles: this.countEvidenceFiles(currentContext),
        documentationFiles: this.countDocumentationFiles(currentContext),
        sourceFiles: this.countSourceFiles(currentContext),
        totalFiles: this.countTotalFiles(currentContext)
      },
      
      gitMetrics: {
        currentBranch: currentContext.gitStatus?.currentBranch || 'unknown',
        totalCommits: this.countCommits(currentContext),
        lastCommitTime: currentContext.gitStatus?.lastCommitTime || null,
        syncStatus: this.getGitSyncStatus(currentContext)
      },
      
      performanceMetrics: {
        avgTaskCompletionTime: this.calculateAvgTaskTime(currentContext),
        productivityScore: this.calculateProductivityScore(currentContext),
        efficiencyRating: this.calculateEfficiencyRating(currentContext)
      }
    };
  }

  // 🤖 AI 어시스턴스 데이터 생성
  async generateAIAssistanceData(currentContext) {
    return {
      currentAgent: this.identifyCurrentAgent(currentContext),
      suggestedNextSteps: await this.generateSmartSuggestions(currentContext),
      automationOpportunities: this.identifyAutomationOpportunities(currentContext),
      riskAssessment: this.performRiskAssessment(currentContext),
      optimizationTips: this.generateOptimizationTips(currentContext)
    };
  }

  // ⏰ 다음 권장 조치 생성
  async generateNextActions(currentContext, scoreData) {
    const actions = [];
    
    // 점수가 낮은 카테고리 우선 개선
    if (scoreData?.recommendations) {
      for (const rec of scoreData.recommendations.slice(0, 3)) {
        actions.push({
          priority: rec.priority,
          action: rec.action,
          category: rec.category,
          estimatedImpact: this.estimateImpact(rec),
          estimatedTime: this.estimateTime(rec)
        });
      }
    }
    
    // 현재 작업 기반 다음 단계
    if (currentContext.currentTask) {
      actions.push({
        priority: 'MEDIUM',
        action: `현재 작업 계속 진행: ${currentContext.currentTask.name}`,
        category: 'TASK_PROGRESS',
        estimatedImpact: 'HIGH',
        estimatedTime: '30-60분'
      });
    }
    
    // 지침 준수 개선
    if (scoreData?.overallScore < 85) {
      actions.push({
        priority: 'HIGH',
        action: '지침 준수 개선 작업 수행',
        category: 'COMPLIANCE',
        estimatedImpact: 'HIGH',
        estimatedTime: '15-30분'
      });
    }
    
    return actions.slice(0, 5);
  }

  // 📊 헬퍼 메소드들
  calculateSessionDuration(context) {
    const start = new Date(context.sessionStartTime || Date.now());
    const now = new Date();
    return Math.round((now - start) / (1000 * 60)); // 분 단위
  }

  getTotalTasks(context) {
    return (context.completedTasks?.length || 0) + 
           (context.inProgressTasks?.length || 0) + 
           (context.pendingTasks?.length || 0);
  }

  getInProgressTasks(context) {
    return context.currentTask ? 1 : 0;
  }

  getPendingTasks(context) {
    const total = this.getTotalTasks(context);
    const completed = context.completedTasks?.length || 0;
    const inProgress = this.getInProgressTasks(context);
    return Math.max(0, total - completed - inProgress);
  }

  calculateProgressPercentage(context) {
    const total = this.getTotalTasks(context);
    const completed = context.completedTasks?.length || 0;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  countEvidenceFiles(context) {
    let count = 0;
    for (const task of context.completedTasks || []) {
      count += task.evidence?.length || 0;
    }
    return count;
  }

  countDocumentationFiles(context) {
    // README.md, .session-context.json 등
    return 2; // 기본값
  }

  countSourceFiles(context) {
    // src/ 폴더 내 파일 수 (추정)
    return 4; // 현재 구현된 모듈 수
  }

  countTotalFiles(context) {
    return this.countEvidenceFiles(context) + 
           this.countDocumentationFiles(context) + 
           this.countSourceFiles(context);
  }

  countCommits(context) {
    // Git 로그에서 커밋 수 계산 (추정)
    return context.gitStatus?.commitCount || 2;
  }

  getGitSyncStatus(context) {
    if (!context.gitStatus?.remoteRepository) return 'NO_REMOTE';
    if (context.gitStatus?.needsCommit) return 'PENDING_COMMIT';
    if (context.gitStatus?.uncommittedChanges?.length > 0) return 'UNCOMMITTED_CHANGES';
    return 'SYNCED';
  }

  calculateAvgTaskTime(context) {
    // 작업 완료 시간 평균 (추정)
    return '45분';
  }

  calculateProductivityScore(context) {
    const completed = context.completedTasks?.length || 0;
    const duration = this.calculateSessionDuration(context);
    
    if (duration === 0) return 0;
    return Math.min(100, Math.round((completed / duration) * 60 * 100));
  }

  calculateEfficiencyRating(context) {
    const productivity = this.calculateProductivityScore(context);
    if (productivity >= 80) return 'EXCELLENT';
    if (productivity >= 60) return 'GOOD';
    if (productivity >= 40) return 'AVERAGE';
    return 'NEEDS_IMPROVEMENT';
  }

  identifyCurrentAgent(context) {
    // 현재 단계에 따른 Agent 식별
    const phase = context.currentPhase || '';
    
    if (phase.includes('분석')) return 'Strategy Planning Agent';
    if (phase.includes('설계')) return 'Product Design Agent';
    if (phase.includes('구축') || phase.includes('구현')) return 'Development Agent';
    if (phase.includes('테스트')) return 'User Testing Agent';
    if (phase.includes('최적화')) return 'Growth Optimization Agent';
    
    return 'General Agent';
  }

  async generateSmartSuggestions(context) {
    const suggestions = [];
    
    // 현재 작업 기반 제안
    if (context.currentTask?.status === 'in_progress') {
      suggestions.push({
        type: 'TASK_COMPLETION',
        description: `${context.currentTask.name} 작업을 완료하고 증거 파일을 생성하세요`,
        priority: 'HIGH'
      });
    }
    
    // 지침 준수 개선 제안
    suggestions.push({
      type: 'COMPLIANCE_IMPROVEMENT',
      description: '지침 준수율 향상을 위해 실시간 동기화를 수행하세요',
      priority: 'MEDIUM'
    });
    
    return suggestions;
  }

  identifyAutomationOpportunities(context) {
    return [
      {
        area: 'Git 동기화',
        description: '변경사항 자동 커밋 및 푸시 설정',
        potentialSaving: '10분/세션'
      },
      {
        area: '증거 파일 생성',
        description: '작업 완료 시 자동 증거 파일 템플릿 생성',
        potentialSaving: '5분/작업'
      }
    ];
  }

  performRiskAssessment(context) {
    const risks = [];
    
    if (!context.gitStatus?.remoteRepository) {
      risks.push({
        type: 'DATA_LOSS',
        severity: 'HIGH',
        description: '원격 저장소 미연동으로 인한 데이터 손실 위험'
      });
    }
    
    return risks;
  }

  generateOptimizationTips(context) {
    return [
      {
        category: 'PRODUCTIVITY',
        tip: '작업 시작 전 명확한 목표와 완료 기준을 설정하세요'
      },
      {
        category: 'QUALITY',
        tip: '각 작업 완료 후 즉시 증거 파일을 생성하여 품질을 보장하세요'
      }
    ];
  }

  estimateImpact(recommendation) {
    const highImpactCategories = ['EVIDENCE_FILE_MANDATORY', 'GITHUB_SYNC_REQUIRED'];
    return highImpactCategories.includes(recommendation.category) ? 'HIGH' : 'MEDIUM';
  }

  estimateTime(recommendation) {
    const timeEstimates = {
      'PROJECT_FOLDER_STRUCTURE': '5-10분',
      'EVIDENCE_FILE_MANDATORY': '10-15분',
      'GITHUB_SYNC_REQUIRED': '5분',
      'REALTIME_DOCUMENTATION': '10-20분'
    };
    
    return timeEstimates[recommendation.category] || '15분';
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SessionContextExpander;
}
