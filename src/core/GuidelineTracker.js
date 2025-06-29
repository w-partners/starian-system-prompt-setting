/**
 * GuidelineTracker - 실시간 지침 준수 모니터링 모듈
 * Starian v4.4 핵심 컴포넌트
 */

class GuidelineTracker {
  constructor() {
    this.rules = [
      'PROJECT_FOLDER_STRUCTURE',
      'EVIDENCE_FILE_MANDATORY', 
      'GITHUB_SYNC_REQUIRED',
      'REALTIME_DOCUMENTATION'
    ];
    this.complianceHistory = [];
    this.lastCheck = null;
  }

  // 🎯 실시간 지침 준수 모니터링
  async trackCompliance(sessionContext) {
    const currentScore = await this.calculateComplianceScore(sessionContext);
    const violations = await this.detectViolations(sessionContext);
    const trend = this.calculateTrend();
    
    const complianceData = {
      timestamp: new Date().toISOString(),
      score: currentScore,
      violations: violations,
      sessionPhase: sessionContext.currentPhase,
      trend: trend
    };
    
    this.complianceHistory.push(complianceData);
    this.lastCheck = complianceData.timestamp;
    
    return complianceData;
  }

  // 📊 지침 준수율 계산
  async calculateComplianceScore(sessionContext) {
    const weights = {
      PROJECT_FOLDER_STRUCTURE: 0.25,
      EVIDENCE_FILE_MANDATORY: 0.30,
      GITHUB_SYNC_REQUIRED: 0.25, 
      REALTIME_DOCUMENTATION: 0.20
    };
    
    let totalScore = 0;
    
    for (const rule of this.rules) {
      const ruleScore = await this.evaluateRule(rule, sessionContext);
      totalScore += ruleScore * weights[rule];
    }
    
    return Math.round(totalScore);
  }

  // 🔍 개별 지침 규칙 평가
  async evaluateRule(rule, sessionContext) {
    switch(rule) {
      case 'PROJECT_FOLDER_STRUCTURE':
        return this.checkProjectStructure(sessionContext);
      case 'EVIDENCE_FILE_MANDATORY':
        return this.checkEvidenceFiles(sessionContext);
      case 'GITHUB_SYNC_REQUIRED':
        return this.checkGitHubSync(sessionContext);
      case 'REALTIME_DOCUMENTATION':
        return this.checkDocumentation(sessionContext);
      default:
        return 0;
    }
  }

  // 📁 프로젝트 구조 검증
  checkProjectStructure(sessionContext) {
    const requiredFolders = ['evidence', 'docs', 'src'];
    const existingFolders = sessionContext.projectStructure || [];
    
    const missingFolders = requiredFolders.filter(
      folder => !existingFolders.includes(folder)
    );
    
    return missingFolders.length === 0 ? 100 : 
           Math.max(0, 100 - (missingFolders.length * 33));
  }

  // 📋 증거 파일 검증
  checkEvidenceFiles(sessionContext) {
    const completedTasks = sessionContext.completedTasks || [];
    let evidenceScore = 0;
    
    for (const task of completedTasks) {
      if (task.evidence && task.evidence.length > 0) {
        evidenceScore += 1;
      }
    }
    
    return completedTasks.length === 0 ? 100 : 
           Math.round((evidenceScore / completedTasks.length) * 100);
  }

  // 🔄 GitHub 동기화 검증
  checkGitHubSync(sessionContext) {
    const gitStatus = sessionContext.gitStatus || {};
    
    if (!gitStatus.remoteRepository) return 0;
    if (gitStatus.uncommittedChanges && gitStatus.uncommittedChanges.length > 0) return 70;
    if (gitStatus.needsCommit) return 85;
    
    return 100;
  }

  // 📚 실시간 문서화 검증
  checkDocumentation(sessionContext) {
    const lastDocUpdate = new Date(sessionContext.lastSyncedAt || 0);
    const now = new Date();
    const timeDiff = now - lastDocUpdate;
    
    // 10분 이내 업데이트 = 100점, 30분 초과 = 감점
    if (timeDiff <= 10 * 60 * 1000) return 100;
    if (timeDiff <= 30 * 60 * 1000) return 85;
    return Math.max(50, 100 - Math.floor(timeDiff / (60 * 1000)));
  }

  // ⚠️ 위반 사항 감지
  async detectViolations(sessionContext) {
    const violations = [];
    
    for (const rule of this.rules) {
      const score = await this.evaluateRule(rule, sessionContext);
      
      if (score < 100) {
        violations.push({
          rule: rule,
          severity: this.getSeverity(score),
          score: score,
          description: this.getViolationDescription(rule, score),
          autoFixable: this.isAutoFixable(rule)
        });
      }
    }
    
    return violations;
  }

  // 📈 준수율 트렌드 계산
  calculateTrend() {
    if (this.complianceHistory.length < 2) return 'STABLE';
    
    const recent = this.complianceHistory.slice(-3);
    const scores = recent.map(h => h.score);
    
    const avgChange = scores.reduce((acc, score, i) => {
      if (i === 0) return acc;
      return acc + (score - scores[i-1]);
    }, 0) / (scores.length - 1);
    
    if (avgChange > 5) return 'IMPROVING';
    if (avgChange < -5) return 'DECLINING';
    return 'STABLE';
  }

  // 🔢 심각도 계산
  getSeverity(score) {
    if (score >= 85) return 'LOW';
    if (score >= 70) return 'MEDIUM';
    return 'HIGH';
  }

  // 📝 위반 설명 생성
  getViolationDescription(rule, score) {
    const descriptions = {
      'PROJECT_FOLDER_STRUCTURE': `프로젝트 폴더 구조 불완전 (${score}%)`,
      'EVIDENCE_FILE_MANDATORY': `증거 파일 생성 미흡 (${score}%)`,
      'GITHUB_SYNC_REQUIRED': `GitHub 동기화 지연 (${score}%)`,
      'REALTIME_DOCUMENTATION': `문서 업데이트 지연 (${score}%)`
    };
    
    return descriptions[rule] || `지침 위반 감지: ${rule}`;
  }

  // 🔧 자동 수정 가능 여부
  isAutoFixable(rule) {
    const autoFixableRules = [
      'PROJECT_FOLDER_STRUCTURE',
      'GITHUB_SYNC_REQUIRED'
    ];
    
    return autoFixableRules.includes(rule);
  }

  // 📊 준수 통계
  getComplianceStats() {
    if (this.complianceHistory.length === 0) return null;
    
    const scores = this.complianceHistory.map(h => h.score);
    
    return {
      currentScore: scores[scores.length - 1],
      averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      maxScore: Math.max(...scores),
      minScore: Math.min(...scores),
      totalChecks: this.complianceHistory.length,
      lastCheck: this.lastCheck,
      trend: this.calculateTrend()
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GuidelineTracker;
}
