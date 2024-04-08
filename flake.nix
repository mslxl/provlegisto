{
  description = "Tauri Javascript App";

  inputs = {
    fenix = {
      url = "github:nix-community/fenix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, utils, fenix }:
    utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ fenix.overlays.default ];
        };
        toolchain = pkgs.fenix.complete;
        buildInputs = with pkgs; [
          # js
          nodejs.pkgs.pnpm

          # rust
          (with toolchain; [
            cargo
            rustc
            rust-src
            clippy
            rustfmt
          ])
          pkg-config
          openssl

          # tauri
          webkitgtk
          dbus

          # github
          act
        ];
      in
      rec {
        # Used by `nix develop`
        devShell = pkgs.mkShell {
          inherit buildInputs;
          XDG_DATA_DIRS = let                                                                                                                                                                                                                                                                                                
            base = pkgs.lib.concatMapStringsSep ":" (x: "${x}/share") [                                                                                                                                                                                                                                                      
              pkgs.shared-mime-info                                                                                                                                                                                                                                                                                          
            ];
            gsettings_schema = pkgs.lib.concatMapStringsSep ":" (x: "${x}/share/gsettings-schemas/${x.name}") [
              pkgs.glib
              pkgs.gsettings-desktop-schemas
              pkgs.gtk3
            ];
          in "${base}:${gsettings_schema}";

          # Specify the rust-src path (many editors rely on this)
          RUST_SRC_PATH = "${toolchain.rust-src}/lib/rustlib/src/rust/library";
          WEBKIT_DISABLE_COMPOSITING_MODE = "1";
        };
      });
}
