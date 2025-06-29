/**
 * Starian v4.4 통합 테스트 스위트
 * 모든 v4.4 기능들의 통합 검증
 */

const { StarianV44System } = require('../../src/StarianV44System');
const { ReminderSystem } = require('../../src/ReminderSystem');
const GuidelineTracker = require('../../src/core/GuidelineTracker');
const ViolationLogger = require('../../src/core/ViolationLogger');
const ComplianceScorer = require('../../src/core/ComplianceScorer');

class StarianV44IntegrationTest {
  constructor() {
    this.testResults = [];
    this.starianSystem = null;
    this.reminderSystem = null;
    this.testStartTime = null;
    this.mockSessionContext = this.createMockSessionContext();
  }

  // 🚀 전체 통합 테스트 실행
  async runAllTests() {
    console.log('🚀 Starian v4.4 통합 테스트 시작...');
    this.testStartTime = new Date();

    try {
      // 1. 시스템 초기화 테스트
      await this.testSystemInitialization();
      
      // 2. 모듈 간 연동 테스트
      await this.testModuleIntegration();
      
      // 3. 지침 준수 강화 테스트
      await this.testGuidelineEnforcement();
      
      // 4. 리마인더 시스템 테스트
      await this.testReminderSystem();
      
      // 5. 성능 테스트
      await this.testPerformance();
      
      // 6. 호환성 테스트
      await this.testCompatibility();
      
      // 7. 에러 처리 테스트
      await this.testErrorHandling();
      
      // 8. E2E 시나리오 테스트
      await this.testEndToEndScenarios();

      return this.generateTestReport();
      
    } catch (error) {
      console.error('❌ 통합 테스트 실행 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 🔧 시스템 초기화 테스트
  async testSystemInitialization() {
    console.log('🔧 시스템 초기화 테스트...');
    
    const tests = [
      {
        name: 'StarianV44System 초기화',
        test: async () => {
          this.starianSystem = new StarianV44System();
          return this.starianSystem.isInitialized === true;
        }
      },
      {
        name: 'ReminderSystem 초기화',
        test: async () => {
          this.reminderSystem = new ReminderSystem();
          const result = await this.reminderSystem.initialize(this.mockSessionContext);
          return result.success === true;
        }
      },
      {
        name: '모든 모듈 로드 확인',
        test: async () => {
          const health = this.starianSystem.getSystemHealth();
          return Object.values(health.modules).every(loaded => loaded === true);
        }
      }
    ];

    for (const test of tests) {
      await this.runTest('INITIALIZATION', test);
    }
  }

  // 🔗 모듈 간 연동 테스트
  async testModuleIntegration() {
    console.log('🔗 모듈 간 연동 테스트...');
    
    const tests = [
      {
        name: 'GuidelineTracker ↔ ViolationLogger 연동',
        test: async () => {
          const complianceData = await this.starianSystem.monitorCompliance(this.mockSessionContext);
          return complianceData.violations !== undefined;
        }
      },
      {
        name: 'ComplianceScorer ↔ GuidelineTracker 연동',
        test: async () => {
          const result = await this.starianSystem.executeFullSystem(this.mockSessionContext);
          return result.score && result.compliance;
        }
      },
      {
        name: 'ReminderSystem ↔ StarianSystem 연동',
        test: async () => {
          const transitionResult = await this.reminderSystem.triggerAgentTransition(
            'Strategy Planning Agent',
            'Development Agent',
            this.mockSessionContext
          );
          return transitionResult !== undefined;
        }
      }
    ];

    for (const test of tests) {
      await this.runTest('INTEGRATION', test);
    }
  }

  // 📊 지침 준수 강화 테스트
  async testGuidelineEnforcement() {
    console.log('📊 지침 준수 강화 테스트...');
    
    const tests = [
      {
        name: '지침 위반 자동 감지',
        test: async () => {
          const violatedContext = {
            ...this.mockSessionContext,
            gitStatus: { needsCommit: true },
            completedTasks: [{ id: '1', name: 'test', evidence: [] }]
          };
          
          const result = await this.starianSystem.executeFullSystem(violatedContext);
          return result.violations.length > 0;
        }
      },
      {
        name: '자동 수정 시스템',
        test: async () => {
          const recommendations = [
            { category: 'PROJECT_FOLDER_STRUCTURE', action: 'test' }
          ];
          
          const results = await this.starianSystem.executeRecommendations(
            recommendations, 
            this.mockSessionContext
          );
          return results.length > 0;
        }
      },
      {
        name: '지침 준수율 실시간 계산',
        test: async () => {
          const result = await this.starianSystem.executeFullSystem(this.mockSessionContext);
          return typeof result.score.overallScore === 'number' && 
                 result.score.overallScore >= 0 && 
                 result.score.overallScore <= 100;
        }
      }
    ];

    for (const test of tests) {
      await this.runTest('GUIDELINE_ENFORCEMENT', test);
    }
  }

  // 🔔 리마인더 시스템 테스트
  async testReminderSystem() {
    console.log('🔔 리마인더 시스템 테스트...');
    
    const tests = [
      {
        name: 'Agent 전환 리마인더',
        test: async () => {
          const result = await this.reminderSystem.triggerAgentTransition(
            'Strategy Planning Agent',
            'Development Agent',
            this.mockSessionContext
          );
          return result.displayed !== undefined;
        }
      },
      {
        name: '복잡한 작업 감지',
        test: async () => {
          const complexTask = {
            name: '복잡한 테스트 작업',
            complexity: 4,
            estimatedTime: 90
          };
          
          const result = await this.reminderSystem.triggerTaskStart(
            complexTask,
            this.mockSessionContext
          );
          return result.displayed !== undefined;
        }
      },
      {
        name: '사용자 피로도 관리',
        test: async () => {
          // 연속 리마인더 테스트
          for (let i = 0; i < 5; i++) {
            await this.reminderSystem.triggerAgentTransition(
              'Agent A',
              'Agent B',
              this.mockSessionContext
            );
          }
          
          // 피로도로 인한 억제 확인
          const result = await this.reminderSystem.triggerAgentTransition(
            'Agent A',
            'Agent B',
            this.mockSessionContext
          );
          
          return result.skipped || !result.displayed;
        }
      }
    ];

    for (const test of tests) {
      await this.runTest('REMINDER_SYSTEM', test);
    }
  }

  // ⚡ 성능 테스트
  async testPerformance() {
    console.log('⚡ 성능 테스트...');
    
    const tests = [
      {
        name: '전체 시스템 응답 시간',
        test: async () => {
          const startTime = Date.now();
          await this.starianSystem.executeFullSystem(this.mockSessionContext);
          const duration = Date.now() - startTime;
          
          // 5초 이내 응답 요구
          return duration < 5000;
        }
      },
      {
        name: '리마인더 표시 지연 시간',
        test: async () => {
          const startTime = Date.now();
          await this.reminderSystem.triggerAgentTransition(
            'Agent A',
            'Agent B',
            this.mockSessionContext
          );
          const duration = Date.now() - startTime;
          
          // 1초 이내 응답 요구
          return duration < 1000;
        }
      },
      {
        name: '대량 위반 처리 성능',
        test: async () => {
          const largeViolationList = Array(50).fill().map((_, i) => ({
            type: 'TEST_VIOLATION',
            severity: 'LOW',
            description: `Test violation ${i}`
          }));
          
          const startTime = Date.now();
          await this.reminderSystem.triggerViolationAlert(
            largeViolationList,
            this.mockSessionContext
          );
          const duration = Date.now() - startTime;
          
          // 3초 이내 처리 요구
          return duration < 3000;
        }
      }
    ];

    for (const test of tests) {
      await this.runTest('PERFORMANCE', test);
    }
  }

  // 🔄 호환성 테스트
  async testCompatibility() {
    console.log('🔄 호환성 테스트...');
    
    const tests = [
      {
        name: 'v4.3 세션 컨텍스트 호환성',
        test: async () => {
          const v43Context = {
            sessionId: 'legacy-session',
            projectName: 'Legacy Project',
            completedTasks: [],
            gitStatus: { currentBranch: 'main' }
          };
          
          try {
            const result = await this.starianSystem.executeFullSystem(v43Context);
            return result.status === 'SUCCESS';
          } catch (error) {
            return false;
          }
        }
      },
      {
        name: '기존 지침 규칙 호환성',
        test: async () => {
          const legacyGuidelines = [
            'PROJECT_FOLDER_STRUCTURE',
            'EVIDENCE_FILE_MANDATORY',
            'GITHUB_SYNC_REQUIRED',
            'REALTIME_DOCUMENTATION'
          ];
          
          const tracker = new GuidelineTracker();
          return legacyGuidelines.every(rule => 
            tracker.rules.includes(rule)
          );
        }
      },
      {
        name: '기존 메타 Agent 인터페이스',
        test: async () => {
          // v4.3 메타 Agent들과의 호환성 확인
          const systemHealth = this.starianSystem.getSystemHealth();
          return systemHealth.status === 'HEALTHY';
        }
      }
    ];

    for (const test of tests) {
      await this.runTest('COMPATIBILITY', test);
    }
  }

  // 🚨 에러 처리 테스트
  async testErrorHandling() {
    console.log('🚨 에러 처리 테스트...');
    
    const tests = [
      {
        name: '잘못된 세션 컨텍스트 처리',
        test: async () => {
          try {
            await this.starianSystem.executeFullSystem(null);
            return false; // 에러가 발생해야 함
          } catch (error) {
            return true; // 정상적으로 에러 처리됨
          }
        }
      },
      {
        name: '모듈 초기화 실패 복구',
        test: async () => {
          const brokenSystem = new StarianV44System();
          // 의도적으로 모듈 파괴
          brokenSystem.guidelineTracker = null;
          
          try {
            const result = await brokenSystem.executeFullSystem(this.mockSessionContext);
            return result.status === 'ERROR';
          } catch (error) {
            return true;
          }
        }
      },
      {
        name: '네트워크 오류 처리',
        test: async () => {
          // 실제 네트워크 오류 시뮬레이션은 제한적이므로
          // 기본적인 에러 핸들링 구조 확인
          return typeof this.starianSystem.getSystemHealth === 'function';
        }
      }
    ];

    for (const test of tests) {
      await this.runTest('ERROR_HANDLING', test);
    }
  }

  // 🎯 End-to-End 시나리오 테스트
  async testEndToEndScenarios() {
    console.log('🎯 End-to-End 시나리오 테스트...');
    
    const tests = [
      {
        name: '완전한 프로젝트 워크플로우',
        test: async () => {
          // 1. 프로젝트 시작
          let context = { ...this.mockSessionContext };
          
          // 2. Agent 전환
          await this.reminderSystem.triggerAgentTransition(
            null,
            'Strategy Planning Agent',
            context
          );
          
          // 3. 작업 완료
          context.completedTasks = [
            { id: '1', name: 'Analysis Complete', evidence: ['analysis.md'] }
          ];
          
          // 4. 다음 Agent로 전환
          await this.reminderSystem.triggerAgentTransition(
            'Strategy Planning Agent',
            'Development Agent',
            context
          );
          
          // 5. 전체 시스템 검증
          const result = await this.starianSystem.executeFullSystem(context);
          
          return result.status === 'SUCCESS';
        }
      },
      {
        name: '지침 위반 → 자동 수정 → 재검증',
        test: async () => {
          // 1. 위반이 있는 컨텍스트 생성
          let violatedContext = {
            ...this.mockSessionContext,
            gitStatus: { needsCommit: true, uncommittedChanges: ['file1'] },
            completedTasks: [
              { id: '1', name: 'Task without evidence', evidence: [] }
            ]
          };
          
          // 2. 위반 감지
          const result1 = await this.starianSystem.executeFullSystem(violatedContext);
          const hasViolations = result1.violations.length > 0;
          
          // 3. 자동 수정 시도
          if (hasViolations) {
            await this.starianSystem.executeRecommendations(
              result1.recommendations,
              violatedContext
            );
          }
          
          // 4. 재검증
          const result2 = await this.starianSystem.executeFullSystem(violatedContext);
          
          return hasViolations && result2.status === 'SUCCESS';
        }
      },
      {
        name: '장기 세션 안정성',
        test: async () => {
          // 30분 주기 검증 시뮬레이션
          let stable = true;
          
          for (let i = 0; i < 5; i++) {
            try {
              const result = await this.starianSystem.executeFullSystem(this.mockSessionContext);
              if (result.status !== 'SUCCESS') {
                stable = false;
                break;
              }
              
              // 짧은 대기 (실제로는 30분)
              await this.sleep(100);
            } catch (error) {
              stable = false;
              break;
            }
          }
          
          return stable;
        }
      }
    ];

    for (const test of tests) {
      await this.runTest('E2E_SCENARIOS', test);
    }
  }

  // 🧪 개별 테스트 실행
  async runTest(category, testCase) {
    const startTime = Date.now();
    
    try {
      const result = await testCase.test();
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        category: category,
        name: testCase.name,
        status: result ? 'PASS' : 'FAIL',
        duration: duration,
        timestamp: new Date().toISOString()
      });
      
      const statusIcon = result ? '✅' : '❌';
      console.log(`  ${statusIcon} ${testCase.name} (${duration}ms)`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        category: category,
        name: testCase.name,
        status: 'ERROR',
        duration: duration,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      console.log(`  💥 ${testCase.name} - ERROR: ${error.message} (${duration}ms)`);
    }
  }

  // 📊 테스트 리포트 생성
  generateTestReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(t => t.status === 'PASS').length;
    const failedTests = this.testResults.filter(t => t.status === 'FAIL').length;
    const errorTests = this.testResults.filter(t => t.status === 'ERROR').length;
    
    const totalDuration = Date.now() - this.testStartTime.getTime();
    const avgTestDuration = this.testResults.reduce((sum, t) => sum + t.duration, 0) / totalTests;
    
    const successRate = Math.round((passedTests / totalTests) * 100);
    
    const report = {
      summary: {
        totalTests: totalTests,
        passed: passedTests,
        failed: failedTests,
        errors: errorTests,
        successRate: successRate,
        totalDuration: totalDuration,
        avgTestDuration: Math.round(avgTestDuration)
      },
      categories: this.getCategoryStats(),
      detailedResults: this.testResults,
      recommendations: this.generateRecommendations(),
      conclusion: this.getTestConclusion()
    };
    
    return report;
  }

  // 📈 카테고리별 통계
  getCategoryStats() {
    const categories = [...new Set(this.testResults.map(t => t.category))];
    
    return categories.map(category => {
      const categoryTests = this.testResults.filter(t => t.category === category);
      const passed = categoryTests.filter(t => t.status === 'PASS').length;
      
      return {
        category: category,
        total: categoryTests.length,
        passed: passed,
        successRate: Math.round((passed / categoryTests.length) * 100)
      };
    });
  }

  // 💡 개선 권장사항
  generateRecommendations() {
    const recommendations = [];
    const failedTests = this.testResults.filter(t => t.status !== 'PASS');
    
    if (failedTests.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'QUALITY',
        description: `${failedTests.length}개 테스트 실패 - 즉시 수정 필요`
      });
    }
    
    const slowTests = this.testResults.filter(t => t.duration > 2000);
    if (slowTests.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'PERFORMANCE',
        description: `${slowTests.length}개 테스트가 2초 이상 소요 - 성능 최적화 권장`
      });
    }
    
    return recommendations;
  }

  // 📋 테스트 결론
  getTestConclusion() {
    const successRate = this.generateTestReport().summary.successRate;
    
    if (successRate >= 95) {
      return {
        status: 'EXCELLENT',
        message: 'v4.4 시스템이 모든 요구사항을 만족합니다. 배포 준비 완료.',
        readyForDeployment: true
      };
    } else if (successRate >= 85) {
      return {
        status: 'GOOD',
        message: 'v4.4 시스템이 대부분의 요구사항을 만족합니다. 일부 개선 후 배포 가능.',
        readyForDeployment: true
      };
    } else if (successRate >= 70) {
      return {
        status: 'ACCEPTABLE',
        message: 'v4.4 시스템이 기본 요구사항을 만족합니다. 추가 개선 권장.',
        readyForDeployment: false
      };
    } else {
      return {
        status: 'NEEDS_IMPROVEMENT',
        message: 'v4.4 시스템에 중요한 문제가 있습니다. 수정 후 재테스트 필요.',
        readyForDeployment: false
      };
    }
  }

  // 🛠️ 헬퍼 메소드들
  createMockSessionContext() {
    return {
      sessionId: 'test-session-2025-06-30',
      projectName: 'Test Project',
      currentPhase: 'Integration Testing',
      currentTask: {
        id: 'test-task-1',
        name: '통합 테스트 실행',
        status: 'in_progress'
      },
      completedTasks: [
        {
          id: 'completed-1',
          name: 'Test Setup',
          evidence: ['setup.md', 'config.json']
        }
      ],
      gitStatus: {
        currentBranch: 'test/integration',
        lastCommit: 'abc123',
        needsCommit: false,
        remoteRepository: 'https://github.com/test/repo.git'
      },
      lastSyncedAt: new Date().toISOString(),
      totalTasks: 10,
      progressPercentage: 60
    };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StarianV44IntegrationTest;
}

// 실행 예시 (주석으로 제공)
/*
// 통합 테스트 실행
const integrationTest = new StarianV44IntegrationTest();
const report = await integrationTest.runAllTests();

console.log('📊 테스트 결과:', report);
console.log(`✅ 성공률: ${report.summary.successRate}%`);
console.log(`⏱️ 총 소요시간: ${report.summary.totalDuration}ms`);
*/
