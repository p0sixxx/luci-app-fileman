include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-fileman
PKG_VERSION:=0.1.0
PKG_RELEASE:=1

PKG_MAINTAINER:=p0sixxx
PKG_LICENSE:=MIT
PKG_ARCH:=all

LUCI_TITLE:=LuCI File Manager
LUCI_DEPENDS:=+luci-base +rpcd-mod-ucode +ucode-mod-fs +uhttpd-mod-ubus
LUCI_PKGARCH:=all

include $(TOPDIR)/feeds/luci/luci.mk
