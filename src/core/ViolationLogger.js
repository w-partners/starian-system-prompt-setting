/**
 * ViolationLogger - 지침 위반 자동 기록 및 분류 시스템
 * Starian v4.4 핵심 컴포넌트
 */

class ViolationLogger {
  constructor() {
    this.violationHistory = [];
    this.sessionStats = {
      totalViolations: 0,
      autoFixed: 0,
      manualFixes: 0,
      recurring: 0
    };
  }

  // ⚠️ 위반 사항 기록
  async logViolation(violation) {
    const violationRecord = {
      id: this.generateUUID(),
      timestamp: new Date().toISOString(),
      type: violation.rule,
      severity: violation.severity,
      score: violation.score,
      description: violation.description,
      autoFixable: violation.autoFixable,
      autoFixed: false,
      sessionContext: violation.sessionContext || {},
      fixAttempts: 0,
      resolved: false
    };
    
    this.violationHistory.push(violationRecord);
    this.sessionStats.totalViolations++;
    
    // 자동 수정 시도
    if (violation.autoFixable) {
      const fixResult = await this.attemptAutoFix(violationRecord);
      violationRecord.autoFixed = fixResult.success;
      violationRecord.fixAttempts = fixResult.attempts;
      
      if (fixResult.success) {
        this.sessionStats.autoFixed++;
        violationRecord.resolved = true;
      }
    }
    
    // 반복 위반 감지
    if (this.isRecurringViolation(violation.rule)) {
      this.sessionStats.recurring++;
      violationRecord.isRecurring = true;
    }
    
    await this.saveToSessionContext(violationRecord);
    await this.updateViolationStats();
    
    return violationRecord;
  }

  // 🔧 자동 수정 시도
  async attemptAutoFix(violation) {
    let attempts = 0;
    let success = false;
    
    try {
      switch(violation.type) {
        case 'PROJECT_FOLDER_STRUCTURE':
          success = await this.fixProjectStructure();
          attempts = 1;
          break;
          
        case 'GITHUB_SYNC_REQUIRED':
          success = await this.fixGitHubSync();
          attempts = 1;
          break;
          
        default:
          // 자동 수정 불가능한 위반
          break;
      }
    } catch (error) {
      console.error(`자동 수정 실패: ${violation.type}`, error);
    }
    
    return { success, attempts };
  }

  // 📁 프로젝트 구조 자동 수정
  async fixProjectStructure() {
    try {
      const requiredFolders = ['evidence', 'docs', 'src'];
      
      for (const folder of requiredFolders) {
        // 실제 구현에서는 filesystem MCP 도구 사용
        console.log(`폴더 생성: ${folder}`);
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  // 🔄 GitHub 동기화 자동 수정
  async fixGitHubSync() {
    try {
      // 실제 구현에서는 git 명령어 실행
      console.log('Git 자동 커밋 및 푸시 실행');
      return true;
    } catch (error) {
      return false;
    }
  }

  // 🔄 반복 위반 감지
  isRecurringViolation(ruleType) {
    const recentViolations = this.violationHistory
      .filter(v => v.type === ruleType)
      .slice(-5); // 최근 5개 확인
      
    return recentViolations.length >= 3;
  }

  // 💾 세션 컨텍스트에 저장
  async saveToSessionContext(violation) {
    // 실제 구현에서는 .session-context.json 업데이트
    console.log('세션 컨텍스트 업데이트:', violation.id);
  }

  // 📊 위반 통계 업데이트
  async updateViolationStats() {
    const stats = {
      ...this.sessionStats,
      lastViolation: this.violationHistory[this.violationHistory.length - 1],
      violationsByType: this.getViolationsByType(),
      violationsBySeverity: this.getViolationsBySeverity(),
      resolutionRate: this.calculateResolutionRate()
    };
    
    // 실제 구현에서는 .session-context.json의 guidelineCompliance 섹션 업데이트
    console.log('위반 통계 업데이트:', stats);
  }

  // 📈 유형별 위반 통계
  getViolationsByType() {
    const typeStats = {};
    
    for (const violation of this.violationHistory) {
      if (!typeStats[violation.type]) {
        typeStats[violation.type] = {
          count: 0,
          autoFixed: 0,
          resolved: 0
        };
      }
      
      typeStats[violation.type].count++;
      if (violation.autoFixed) typeStats[violation.type].autoFixed++;
      if (violation.resolved) typeStats[violation.type].resolved++;
    }
    
    return typeStats;
  }

  // 📊 심각도별 위반 통계
  getViolationsBySeverity() {
    const severityStats = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    
    for (const violation of this.violationHistory) {
      severityStats[violation.severity]++;
    }
    
    return severityStats;
  }

  // 🎯 해결율 계산
  calculateResolutionRate() {
    if (this.violationHistory.length === 0) return 100;
    
    const resolved = this.violationHistory.filter(v => v.resolved).length;
    return Math.round((resolved / this.violationHistory.length) * 100);
  }

  // 🔍 위반 기록 조회
  getViolationHistory(filter = {}) {
    let filtered = [...this.violationHistory];
    
    if (filter.type) {
      filtered = filtered.filter(v => v.type === filter.type);
    }
    
    if (filter.severity) {
      filtered = filtered.filter(v => v.severity === filter.severity);
    }
    
    if (filter.resolved !== undefined) {
      filtered = filtered.filter(v => v.resolved === filter.resolved);
    }
    
    if (filter.limit) {
      filtered = filtered.slice(-filter.limit);
    }
    
    return filtered;
  }

  // 🆔 UUID 생성
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // 📋 위반 리포트 생성
  generateViolationReport() {
    return {
      summary: {
        totalViolations: this.sessionStats.totalViolations,
        autoFixRate: Math.round((this.sessionStats.autoFixed / this.sessionStats.totalViolations) * 100) || 0,
        resolutionRate: this.calculateResolutionRate(),
        recurringIssues: this.sessionStats.recurring
      },
      byType: this.getViolationsByType(),
      bySeverity: this.getViolationsBySeverity(),
      recentViolations: this.getViolationHistory({ limit: 10 }),
      recommendations: this.generateRecommendations()
    };
  }

  // 💡 개선 권장사항 생성
  generateRecommendations() {
    const recommendations = [];
    const typeStats = this.getViolationsByType();
    
    for (const [type, stats] of Object.entries(typeStats)) {
      if (stats.count > 2) {
        recommendations.push({
          priority: 'HIGH',
          type: type,
          description: `${type} 위반이 ${stats.count}회 발생했습니다. 자동화 개선이 필요합니다.`
        });
      }
    }
    
    return recommendations;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ViolationLogger;
}
