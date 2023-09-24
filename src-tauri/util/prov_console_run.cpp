#include <chrono>
#include <cstdio>
#include <cstdlib>
#include <iostream>
#include <process.h>

using namespace std::chrono;

void pause_and_exit(int code) {
  printf("Press [Enter] to close windows...");
  getchar();
  exit(code);
}

int main(int argc, char **argv) {
  if (argc < 2) {
    fprintf(stderr, "** Error: no command provided\n");
    pause_and_exit(1);
  }

  auto handle = _spawnvp(_P_NOWAIT, argv[1], &argv[1]);
  if (handle < 0) {
    perror("_spawnv failed");
    pause_and_exit(1);
  }
  auto start_time = high_resolution_clock::now();
  int status;
  if (_cwait(&status, handle, _WAIT_CHILD) == -1) {
    perror("_cwait failed");
    pause_and_exit(1);
  }

  auto end_time = high_resolution_clock::now();
  auto duration = duration_cast<milliseconds>(end_time - start_time);
  printf("\n---\nDuration: %lld ms\n", duration.count());
  pause_and_exit(status);
}
