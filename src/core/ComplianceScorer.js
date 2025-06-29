/**
 * ComplianceScorer - 지침 준수율 실시간 계산 엔진
 * Starian v4.4 핵심 컴포넌트
 */

class ComplianceScorer {
  constructor() {
    this.weights = {
      PROJECT_FOLDER_STRUCTURE: 0.25,
      EVIDENCE_FILE_MANDATORY: 0.30,
      GITHUB_SYNC_REQUIRED: 0.25,
      REALTIME_DOCUMENTATION: 0.20
    };
    
    this.scoreHistory = [];
    this.thresholds = {
      EXCELLENT: 95,
      GOOD: 85,
      ACCEPTABLE: 70,
      POOR: 50
    };
  }

  // 📊 종합 준수율 계산
  calculateOverallScore(sessionData) {
    const categoryScores = {};
    let totalScore = 0;
    
    // 각 카테고리별 점수 계산
    for (const [category, weight] of Object.entries(this.weights)) {
      const categoryScore = this.evaluateCategory(category, sessionData);
      categoryScores[category] = categoryScore;
      totalScore += categoryScore * weight;
    }
    
    const finalScore = Math.round(totalScore);
    
    // 점수 히스토리 저장
    this.scoreHistory.push({
      timestamp: new Date().toISOString(),
      overallScore: finalScore,
      categoryScores: categoryScores,
      grade: this.getGrade(finalScore)
    });
    
    return {
      overallScore: finalScore,
      grade: this.getGrade(finalScore),
      categoryScores: categoryScores,
      breakdown: this.getScoreBreakdown(categoryScores),
      trend: this.calculateTrend(),
      recommendations: this.generateScoreRecommendations(categoryScores)
    };
  }

  // 🎯 카테고리별 점수 평가
  evaluateCategory(category, sessionData) {
    switch(category) {
      case 'PROJECT_FOLDER_STRUCTURE':
        return this.scoreProjectStructure(sessionData);
      case 'EVIDENCE_FILE_MANDATORY':
        return this.scoreEvidenceFiles(sessionData);
      case 'GITHUB_SYNC_REQUIRED':
        return this.scoreGitHubSync(sessionData);
      case 'REALTIME_DOCUMENTATION':
        return this.scoreDocumentation(sessionData);
      default:
        return 0;
    }
  }

  // 📁 프로젝트 구조 점수 계산
  scoreProjectStructure(sessionData) {
    const requiredFolders = ['evidence', 'docs', 'src'];
    const requiredFiles = ['.session-context.json', 'README.md'];
    
    let score = 0;
    
    // 폴더 구조 평가 (60점)
    const existingFolders = sessionData.projectStructure?.folders || [];
    const missingFolders = requiredFolders.filter(
      folder => !existingFolders.includes(folder)
    );
    score += Math.max(0, 60 - (missingFolders.length * 20));
    
    // 필수 파일 평가 (40점)
    const existingFiles = sessionData.projectStructure?.files || [];
    const missingFiles = requiredFiles.filter(
      file => !existingFiles.includes(file)
    );
    score += Math.max(0, 40 - (missingFiles.length * 20));
    
    return Math.min(100, score);
  }

  // 📋 증거 파일 점수 계산
  scoreEvidenceFiles(sessionData) {
    const completedTasks = sessionData.completedTasks || [];
    
    if (completedTasks.length === 0) return 100; // 작업이 없으면 만점
    
    let evidenceScore = 0;
    let qualityBonus = 0;
    
    for (const task of completedTasks) {
      // 기본 증거 파일 존재 (70점 배분)
      if (task.evidence && task.evidence.length > 0) {
        evidenceScore += 70 / completedTasks.length;
        
        // 증거 품질 보너스 (30점 배분)
        const evidenceQuality = this.assessEvidenceQuality(task.evidence);
        qualityBonus += (30 / completedTasks.length) * (evidenceQuality / 100);
      }
    }
    
    return Math.round(evidenceScore + qualityBonus);
  }

  // 🔍 증거 파일 품질 평가
  assessEvidenceQuality(evidence) {
    let qualityScore = 0;
    
    // completion-proof.md 존재 (50점)
    if (evidence.some(e => e.includes('completion-proof.md'))) {
      qualityScore += 50;
    }
    
    // 추가 산출물 존재 (30점)
    if (evidence.length > 1) {
      qualityScore += 30;
    }
    
    // verification.json 존재 (20점)
    if (evidence.some(e => e.includes('verification.json'))) {
      qualityScore += 20;
    }
    
    return qualityScore;
  }

  // 🔄 GitHub 동기화 점수 계산
  scoreGitHubSync(sessionData) {
    const gitStatus = sessionData.gitStatus || {};
    let score = 0;
    
    // 원격 저장소 존재 (30점)
    if (gitStatus.remoteRepository) {
      score += 30;
    }
    
    // 커밋 상태 (40점)
    if (!gitStatus.needsCommit) {
      score += 40;
    } else if (gitStatus.uncommittedChanges?.length === 0) {
      score += 30; // 변경사항은 없지만 커밋 필요
    }
    
    // 브랜치 전략 (30점)
    if (gitStatus.currentBranch && gitStatus.currentBranch !== 'main') {
      score += 20; // 개발 브랜치 사용
    }
    if (gitStatus.lastCommit) {
      score += 10; // 최근 커밋 존재
    }
    
    return Math.min(100, score);
  }

  // 📚 실시간 문서화 점수 계산
  scoreDocumentation(sessionData) {
    let score = 0;
    
    // README.md 최신성 (40점)
    const lastUpdate = new Date(sessionData.lastSyncedAt || 0);
    const now = new Date();
    const timeDiff = now - lastUpdate;
    
    if (timeDiff <= 10 * 60 * 1000) { // 10분 이내
      score += 40;
    } else if (timeDiff <= 30 * 60 * 1000) { // 30분 이내
      score += 30;
    } else if (timeDiff <= 60 * 60 * 1000) { // 1시간 이내
      score += 20;
    }
    
    // 진행률 정확성 (30점)
    const reportedProgress = sessionData.reportedProgress || 0;
    const actualProgress = this.calculateActualProgress(sessionData);
    const progressAccuracy = Math.max(0, 100 - Math.abs(reportedProgress - actualProgress));
    score += (30 * progressAccuracy) / 100;
    
    // 세션 컨텍스트 완전성 (30점)
    const contextCompleteness = this.assessContextCompleteness(sessionData);
    score += (30 * contextCompleteness) / 100;
    
    return Math.round(score);
  }

  // 📈 실제 진행률 계산
  calculateActualProgress(sessionData) {
    const totalTasks = sessionData.totalTasks || 0;
    const completedTasks = sessionData.completedTasks?.length || 0;
    
    if (totalTasks === 0) return 0;
    return Math.round((completedTasks / totalTasks) * 100);
  }

  // 📋 세션 컨텍스트 완전성 평가
  assessContextCompleteness(sessionData) {
    const requiredFields = [
      'sessionId', 'projectName', 'currentPhase', 
      'currentTask', 'gitStatus', 'nextActions'
    ];
    
    let completeness = 0;
    for (const field of requiredFields) {
      if (sessionData[field]) {
        completeness += 100 / requiredFields.length;
      }
    }
    
    return completeness;
  }

  // 🏆 등급 산정
  getGrade(score) {
    if (score >= this.thresholds.EXCELLENT) return 'EXCELLENT';
    if (score >= this.thresholds.GOOD) return 'GOOD';
    if (score >= this.thresholds.ACCEPTABLE) return 'ACCEPTABLE';
    if (score >= this.thresholds.POOR) return 'POOR';
    return 'CRITICAL';
  }

  // 📊 점수 세부 분석
  getScoreBreakdown(categoryScores) {
    const breakdown = {};
    
    for (const [category, score] of Object.entries(categoryScores)) {
      breakdown[category] = {
        score: score,
        weight: this.weights[category],
        contribution: Math.round(score * this.weights[category]),
        grade: this.getGrade(score)
      };
    }
    
    return breakdown;
  }

  // 📈 점수 트렌드 분석
  calculateTrend() {
    if (this.scoreHistory.length < 2) return 'STABLE';
    
    const recent = this.scoreHistory.slice(-3);
    const scores = recent.map(h => h.overallScore);
    
    const avgChange = scores.reduce((acc, score, i) => {
      if (i === 0) return acc;
      return acc + (score - scores[i-1]);
    }, 0) / (scores.length - 1);
    
    if (avgChange > 5) return 'IMPROVING';
    if (avgChange < -5) return 'DECLINING';
    return 'STABLE';
  }

  // 💡 점수 개선 권장사항
  generateScoreRecommendations(categoryScores) {
    const recommendations = [];
    
    for (const [category, score] of Object.entries(categoryScores)) {
      if (score < this.thresholds.GOOD) {
        const recommendation = this.getCategoryRecommendation(category, score);
        recommendations.push({
          category: category,
          currentScore: score,
          targetScore: this.thresholds.GOOD,
          priority: score < this.thresholds.POOR ? 'HIGH' : 'MEDIUM',
          action: recommendation
        });
      }
    }
    
    return recommendations.sort((a, b) => 
      (a.priority === 'HIGH' ? 0 : 1) - (b.priority === 'HIGH' ? 0 : 1)
    );
  }

  // 🎯 카테고리별 개선 권장사항
  getCategoryRecommendation(category, score) {
    const recommendations = {
      'PROJECT_FOLDER_STRUCTURE': '필수 폴더(evidence, docs, src) 및 파일(.session-context.json) 생성',
      'EVIDENCE_FILE_MANDATORY': '모든 완료 작업에 대한 completion-proof.md 파일 생성',
      'GITHUB_SYNC_REQUIRED': '변경사항 즉시 커밋 및 원격 저장소 동기화',
      'REALTIME_DOCUMENTATION': 'README.md 및 세션 컨텍스트 실시간 업데이트'
    };
    
    return recommendations[category] || '지침 준수율 개선 필요';
  }

  // 📋 종합 리포트 생성
  generateComplianceReport() {
    if (this.scoreHistory.length === 0) return null;
    
    const latest = this.scoreHistory[this.scoreHistory.length - 1];
    const allScores = this.scoreHistory.map(h => h.overallScore);
    
    return {
      currentStatus: {
        score: latest.overallScore,
        grade: latest.grade,
        timestamp: latest.timestamp
      },
      statistics: {
        averageScore: Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length),
        maxScore: Math.max(...allScores),
        minScore: Math.min(...allScores),
        totalAssessments: this.scoreHistory.length
      },
      trend: this.calculateTrend(),
      categoryBreakdown: this.getScoreBreakdown(latest.categoryScores),
      recommendations: this.generateScoreRecommendations(latest.categoryScores)
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ComplianceScorer;
}
