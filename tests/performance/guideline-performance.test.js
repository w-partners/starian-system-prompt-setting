/**
 * Starian v4.4 성능 테스트 스위트
 * 시스템 성능 및 응답 시간 검증
 */

class StarianV44PerformanceTest {
  constructor() {
    this.performanceResults = [];
    this.benchmarkTargets = {
      fullSystemExecution: 5000,    // 5초 이내
      reminderDisplay: 1000,        // 1초 이내
      complianceCalculation: 2000,  // 2초 이내
      violationDetection: 1500,     // 1.5초 이내
      autoFixExecution: 3000,       // 3초 이내
      periodicCheck: 10000          // 10초 이내
    };
    this.loadTestIterations = 100;
    this.stressTestIterations = 500;
  }

  // 🚀 전체 성능 테스트 실행
  async runAllPerformanceTests() {
    console.log('🚀 Starian v4.4 성능 테스트 시작...');
    
    try {
      // 1. 기본 성능 테스트
      await this.testBasicPerformance();
      
      // 2. 부하 테스트
      await this.testLoadPerformance();
      
      // 3. 스트레스 테스트
      await this.testStressPerformance();
      
      // 4. 메모리 사용량 테스트
      await this.testMemoryUsage();
      
      // 5. 동시성 테스트
      await this.testConcurrency();
      
      // 6. 장기 실행 안정성 테스트
      await this.testLongRunningStability();

      return this.generatePerformanceReport();
      
    } catch (error) {
      console.error('❌ 성능 테스트 실행 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // ⚡ 기본 성능 테스트
  async testBasicPerformance() {
    console.log('⚡ 기본 성능 테스트...');
    
    const tests = [
      {
        name: '전체 시스템 실행 시간',
        target: this.benchmarkTargets.fullSystemExecution,
        test: async () => {
          const { StarianV44System } = require('../../src/StarianV44System');
          const system = new StarianV44System();
          const mockContext = this.createMockContext();
          
          const startTime = performance.now();
          await system.executeFullSystem(mockContext);
          const endTime = performance.now();
          
          return endTime - startTime;
        }
      },
      {
        name: '리마인더 표시 시간',
        target: this.benchmarkTargets.reminderDisplay,
        test: async () => {
          const { ReminderSystem } = require('../../src/ReminderSystem');
          const reminderSystem = new ReminderSystem();
          await reminderSystem.initialize(this.createMockContext());
          
          const startTime = performance.now();
          await reminderSystem.triggerAgentTransition(
            'Strategy Planning Agent',
            'Development Agent',
            this.createMockContext()
          );
          const endTime = performance.now();
          
          return endTime - startTime;
        }
      },
      {
        name: '지침 준수율 계산 시간',
        target: this.benchmarkTargets.complianceCalculation,
        test: async () => {
          const ComplianceScorer = require('../../src/core/ComplianceScorer');
          const scorer = new ComplianceScorer();
          const mockContext = this.createMockContext();
          
          const startTime = performance.now();
          scorer.calculateOverallScore(mockContext);
          const endTime = performance.now();
          
          return endTime - startTime;
        }
      },
      {
        name: '위반 감지 시간',
        target: this.benchmarkTargets.violationDetection,
        test: async () => {
          const GuidelineTracker = require('../../src/core/GuidelineTracker');
          const tracker = new GuidelineTracker();
          const mockContext = this.createMockContext();
          
          const startTime = performance.now();
          await tracker.detectViolations(mockContext);
          const endTime = performance.now();
          
          return endTime - startTime;
        }
      }
    ];

    for (const test of tests) {
      await this.runPerformanceTest('BASIC', test);
    }
  }

  // 📊 부하 테스트
  async testLoadPerformance() {
    console.log('📊 부하 테스트...');
    
    const tests = [
      {
        name: '연속 시스템 실행 (100회)',
        target: this.benchmarkTargets.fullSystemExecution * 1.5, // 50% 여유
        test: async () => {
          const { StarianV44System } = require('../../src/StarianV44System');
          const system = new StarianV44System();
          const mockContext = this.createMockContext();
          
          const startTime = performance.now();
          
          for (let i = 0; i < this.loadTestIterations; i++) {
            await system.executeFullSystem(mockContext);
          }
          
          const endTime = performance.now();
          return (endTime - startTime) / this.loadTestIterations; // 평균 시간
        }
      },
      {
        name: '대량 위반 처리',
        target: this.benchmarkTargets.violationDetection * 2,
        test: async () => {
          const ViolationLogger = require('../../src/core/ViolationLogger');
          const logger = new ViolationLogger();
          
          const violations = Array(100).fill().map((_, i) => ({
            rule: 'TEST_RULE',
            severity: 'MEDIUM',
            description: `Test violation ${i}`,
            autoFixable: false
          }));
          
          const startTime = performance.now();
          
          for (const violation of violations) {
            await logger.logViolation(violation);
          }
          
          const endTime = performance.now();
          return endTime - startTime;
        }
      },
      {
        name: '복잡한 세션 컨텍스트 처리',
        target: this.benchmarkTargets.complianceCalculation * 2,
        test: async () => {
          const ComplianceScorer = require('../../src/core/ComplianceScorer');
          const scorer = new ComplianceScorer();
          
          // 복잡한 컨텍스트 생성 (100개 완료 작업)
          const complexContext = {
            ...this.createMockContext(),
            completedTasks: Array(100).fill().map((_, i) => ({
              id: `task-${i}`,
              name: `Task ${i}`,
              evidence: [`evidence-${i}.md`]
            }))
          };
          
          const startTime = performance.now();
          scorer.calculateOverallScore(complexContext);
          const endTime = performance.now();
          
          return endTime - startTime;
        }
      }
    ];

    for (const test of tests) {
      await this.runPerformanceTest('LOAD', test);
    }
  }

  // 🔥 스트레스 테스트
  async testStressPerformance() {
    console.log('🔥 스트레스 테스트...');
    
    const tests = [
      {
        name: '극한 부하 시스템 실행 (500회)',
        target: this.benchmarkTargets.fullSystemExecution * 2, // 100% 여유
        test: async () => {
          const { StarianV44System } = require('../../src/StarianV44System');
          const system = new StarianV44System();
          const mockContext = this.createMockContext();
          
          const startTime = performance.now();
          
          for (let i = 0; i < this.stressTestIterations; i++) {
            await system.executeFullSystem(mockContext);
            
            // 매 50회마다 짧은 휴식
            if (i % 50 === 0) {
              await this.sleep(10);
            }
          }
          
          const endTime = performance.now();
          return (endTime - startTime) / this.stressTestIterations;
        }
      },
      {
        name: '메모리 집약적 작업',
        target: this.benchmarkTargets.complianceCalculation * 3,
        test: async () => {
          const GuidelineTracker = require('../../src/core/GuidelineTracker');
          const tracker = new GuidelineTracker();
          
          // 대량의 히스토리 데이터 생성
          for (let i = 0; i < 1000; i++) {
            tracker.complianceHistory.push({
              timestamp: new Date().toISOString(),
              score: Math.random() * 100,
              violations: [],
              sessionPhase: `phase-${i}`
            });
          }
          
          const startTime = performance.now();
          
          // 통계 계산 반복 실행
          for (let i = 0; i < 100; i++) {
            tracker.getComplianceStats();
          }
          
          const endTime = performance.now();
          return endTime - startTime;
        }
      }
    ];

    for (const test of tests) {
      await this.runPerformanceTest('STRESS', test);
    }
  }

  // 💾 메모리 사용량 테스트
  async testMemoryUsage() {
    console.log('💾 메모리 사용량 테스트...');
    
    const tests = [
      {
        name: '시스템 초기화 메모리 사용량',
        target: 50, // MB
        test: async () => {
          const initialMemory = this.getMemoryUsage();
          
          const { StarianV44System } = require('../../src/StarianV44System');
          const system = new StarianV44System();
          
          const afterInitMemory = this.getMemoryUsage();
          return afterInitMemory - initialMemory;
        }
      },
      {
        name: '장기 실행 메모리 누수 검사',
        target: 100, // MB 증가 한계
        test: async () => {
          const { StarianV44System } = require('../../src/StarianV44System');
          const system = new StarianV44System();
          const mockContext = this.createMockContext();
          
          const initialMemory = this.getMemoryUsage();
          
          // 100회 반복 실행
          for (let i = 0; i < 100; i++) {
            await system.executeFullSystem(mockContext);
            
            // 매 20회마다 강제 가비지 컬렉션
            if (i % 20 === 0 && global.gc) {
              global.gc();
            }
          }
          
          const finalMemory = this.getMemoryUsage();
          return finalMemory - initialMemory;
        }
      }
    ];

    for (const test of tests) {
      await this.runPerformanceTest('MEMORY', test);
    }
  }

  // 🔀 동시성 테스트
  async testConcurrency() {
    console.log('🔀 동시성 테스트...');
    
    const tests = [
      {
        name: '동시 시스템 실행 (10개)',
        target: this.benchmarkTargets.fullSystemExecution * 1.5,
        test: async () => {
          const { StarianV44System } = require('../../src/StarianV44System');
          const promises = [];
          
          const startTime = performance.now();
          
          for (let i = 0; i < 10; i++) {
            const system = new StarianV44System();
            const mockContext = this.createMockContext();
            promises.push(system.executeFullSystem(mockContext));
          }
          
          await Promise.all(promises);
          
          const endTime = performance.now();
          return endTime - startTime;
        }
      },
      {
        name: '동시 리마인더 요청 (20개)',
        target: this.benchmarkTargets.reminderDisplay * 2,
        test: async () => {
          const { ReminderSystem } = require('../../src/ReminderSystem');
          const reminderSystem = new ReminderSystem();
          await reminderSystem.initialize(this.createMockContext());
          
          const promises = [];
          const startTime = performance.now();
          
          for (let i = 0; i < 20; i++) {
            promises.push(
              reminderSystem.triggerAgentTransition(
                'Agent A',
                'Agent B',
                this.createMockContext()
              )
            );
          }
          
          await Promise.all(promises);
          
          const endTime = performance.now();
          return endTime - startTime;
        }
      }
    ];

    for (const test of tests) {
      await this.runPerformanceTest('CONCURRENCY', test);
    }
  }

  // ⏳ 장기 실행 안정성 테스트
  async testLongRunningStability() {
    console.log('⏳ 장기 실행 안정성 테스트...');
    
    const tests = [
      {
        name: '30분 연속 실행 시뮬레이션',
        target: this.benchmarkTargets.periodicCheck,
        test: async () => {
          const { StarianV44System } = require('../../src/StarianV44System');
          const system = new StarianV44System();
          const mockContext = this.createMockContext();
          
          let totalTime = 0;
          let iterations = 0;
          const maxIterations = 20; // 실제로는 30분이지만 테스트에서는 20회
          
          for (let i = 0; i < maxIterations; i++) {
            const startTime = performance.now();
            await system.executeFullSystem(mockContext);
            const endTime = performance.now();
            
            totalTime += (endTime - startTime);
            iterations++;
            
            // 시뮬레이션 간격
            await this.sleep(100);
          }
          
          return totalTime / iterations; // 평균 시간
        }
      }
    ];

    for (const test of tests) {
      await this.runPerformanceTest('STABILITY', test);
    }
  }

  // 🧪 개별 성능 테스트 실행
  async runPerformanceTest(category, testCase) {
    console.log(`  🔄 ${testCase.name} 실행 중...`);
    
    try {
      const result = await testCase.test();
      const passed = result <= testCase.target;
      const efficiency = Math.round((testCase.target / result) * 100);
      
      this.performanceResults.push({
        category: category,
        name: testCase.name,
        result: result,
        target: testCase.target,
        passed: passed,
        efficiency: efficiency,
        timestamp: new Date().toISOString()
      });
      
      const statusIcon = passed ? '✅' : '⚠️';
      const unit = category === 'MEMORY' ? 'MB' : 'ms';
      console.log(`    ${statusIcon} ${result.toFixed(2)}${unit} (목표: ${testCase.target}${unit}, 효율성: ${efficiency}%)`);
      
    } catch (error) {
      this.performanceResults.push({
        category: category,
        name: testCase.name,
        result: null,
        target: testCase.target,
        passed: false,
        efficiency: 0,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      console.log(`    💥 ${testCase.name} - ERROR: ${error.message}`);
    }
  }

  // 📊 성능 리포트 생성
  generatePerformanceReport() {
    const totalTests = this.performanceResults.length;
    const passedTests = this.performanceResults.filter(t => t.passed).length;
    const avgEfficiency = this.performanceResults
      .filter(t => t.efficiency > 0)
      .reduce((sum, t) => sum + t.efficiency, 0) / totalTests;
    
    const report = {
      summary: {
        totalTests: totalTests,
        passed: passedTests,
        failed: totalTests - passedTests,
        successRate: Math.round((passedTests / totalTests) * 100),
        avgEfficiency: Math.round(avgEfficiency),
        overallPerformance: this.calculateOverallPerformance()
      },
      categories: this.getPerformanceByCategory(),
      detailedResults: this.performanceResults,
      recommendations: this.generatePerformanceRecommendations(),
      benchmarks: this.benchmarkTargets
    };
    
    return report;
  }

  // 📈 카테고리별 성능 분석
  getPerformanceByCategory() {
    const categories = [...new Set(this.performanceResults.map(t => t.category))];
    
    return categories.map(category => {
      const categoryTests = this.performanceResults.filter(t => t.category === category);
      const passed = categoryTests.filter(t => t.passed).length;
      const avgEfficiency = categoryTests
        .filter(t => t.efficiency > 0)
        .reduce((sum, t) => sum + t.efficiency, 0) / categoryTests.length;
      
      return {
        category: category,
        total: categoryTests.length,
        passed: passed,
        successRate: Math.round((passed / categoryTests.length) * 100),
        avgEfficiency: Math.round(avgEfficiency)
      };
    });
  }

  // 🎯 전체 성능 등급 계산
  calculateOverallPerformance() {
    const successRate = this.performanceResults.filter(t => t.passed).length / this.performanceResults.length;
    const avgEfficiency = this.performanceResults
      .filter(t => t.efficiency > 0)
      .reduce((sum, t) => sum + t.efficiency, 0) / this.performanceResults.length;
    
    if (successRate >= 0.9 && avgEfficiency >= 80) {
      return 'EXCELLENT';
    } else if (successRate >= 0.8 && avgEfficiency >= 70) {
      return 'GOOD';
    } else if (successRate >= 0.7 && avgEfficiency >= 60) {
      return 'ACCEPTABLE';
    } else {
      return 'NEEDS_OPTIMIZATION';
    }
  }

  // 💡 성능 개선 권장사항
  generatePerformanceRecommendations() {
    const recommendations = [];
    const failedTests = this.performanceResults.filter(t => !t.passed);
    
    // 실패한 테스트 분석
    if (failedTests.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'PERFORMANCE',
        description: `${failedTests.length}개 성능 테스트 실패 - 최적화 필요`,
        failedTests: failedTests.map(t => t.name)
      });
    }
    
    // 효율성 분석
    const lowEfficiencyTests = this.performanceResults.filter(t => t.efficiency < 70);
    if (lowEfficiencyTests.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'EFFICIENCY',
        description: `${lowEfficiencyTests.length}개 테스트의 효율성 개선 권장`,
        lowEfficiencyTests: lowEfficiencyTests.map(t => t.name)
      });
    }
    
    // 메모리 사용량 분석
    const memoryTests = this.performanceResults.filter(t => t.category === 'MEMORY');
    const highMemoryUsage = memoryTests.filter(t => t.result > t.target);
    if (highMemoryUsage.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'MEMORY',
        description: '메모리 사용량 최적화 권장'
      });
    }
    
    return recommendations;
  }

  // 🛠️ 헬퍼 메소드들
  createMockContext() {
    return {
      sessionId: 'perf-test-session',
      projectName: 'Performance Test Project',
      currentPhase: 'Performance Testing',
      completedTasks: [
        { id: '1', name: 'Test Task 1', evidence: ['evidence1.md'] },
        { id: '2', name: 'Test Task 2', evidence: ['evidence2.md'] }
      ],
      gitStatus: {
        currentBranch: 'test/performance',
        needsCommit: false,
        remoteRepository: 'https://github.com/test/perf.git'
      },
      lastSyncedAt: new Date().toISOString(),
      totalTasks: 10
    };
  }

  getMemoryUsage() {
    const memUsage = process.memoryUsage();
    return memUsage.heapUsed / 1024 / 1024; // MB 단위
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StarianV44PerformanceTest;
}

// 실행 예시 (주석으로 제공)
/*
// 성능 테스트 실행
const performanceTest = new StarianV44PerformanceTest();
const report = await performanceTest.runAllPerformanceTests();

console.log('📊 성능 테스트 결과:', report);
console.log(`⚡ 성능 등급: ${report.summary.overallPerformance}`);
console.log(`🎯 성공률: ${report.summary.successRate}%`);
console.log(`📈 평균 효율성: ${report.summary.avgEfficiency}%`);
*/
